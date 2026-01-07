// 文件名：utils/index.js
const fs = require('fs-extra');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// 动态加载 ES6 模块
let uuidv4 = null;

const loadUuid = async () => {
  if (!uuidv4) {
    const uuid = await import('uuid');
    uuidv4 = uuid.v4;
  }
  return uuidv4;
};

// 递归扫描目录的辅助函数
async function scanDirectory(dir, exts) {
  const results = [];
  
  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // 跳过 node_modules 等目录
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await scan(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (exts.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  }
  
  await scan(dir);
  return results;
}

// 1. 组件文件扫描工具
exports.scanComponentFiles = async (componentDir, supportedExts = ['.js', '.ts', '.jsx', '.tsx', '.vue']) => {
  try {
    console.log(componentDir, '路径')
    // 检查目录是否存在
    const exists = await fs.pathExists(componentDir);
    if (!exists) {
      throw new Error(`目录不存在: ${componentDir}`);
    }
    
    // 使用自定义扫描函数
    const files = await scanDirectory(componentDir, supportedExts);
    return files;
  } catch (err) {
    throw err;
  }
};

// 2. 组件元信息提取工具（不提取完整代码，仅核心特征）
exports.extractComponentMeta = async (filePath) => {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const ext = path.extname(filePath);
  const fileName = path.basename(filePath);
  const relativePath = path.relative(process.cwd(), filePath);

  // 动态加载 uuid
  const generateUuid = await loadUuid();

  const componentMeta = {
    id: generateUuid(),
    fileName,
    relativePath,
    fileExt: ext,
    componentName: '',
    description: '',
    props: [],
    usageScene: [],
    featureSummary: '', // 用于向量化的核心特征
    createTime: new Date().toISOString()
  };

  // React/TS/JSX 组件解析
  if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
    try {
      const ast = parse(fileContent, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'classProperties']
      });

      // 提取注释（从 AST 的 comments 数组中获取）
      if (ast.comments && ast.comments.length > 0) {
        // 查找第一个块注释作为描述
        const blockComment = ast.comments.find(comment => comment.type === 'CommentBlock');
        if (blockComment) {
          componentMeta.description = blockComment.value
            .trim()
            .replace(/^\*+\s*/gm, '') // 移除每行开头的星号
            .replace(/\n\s*\n/g, '\n') // 合并多个空行
            .trim();
        }
      }

      traverse(ast, {
        FunctionDeclaration(path) {
          if (path.node.id) componentMeta.componentName = path.node.id.name;
        },
        ExportDefaultDeclaration(path) {
          if (['ArrowFunctionExpression', 'FunctionExpression'].includes(path.node.declaration.type)) {
            componentMeta.componentName = fileName.replace(ext, '').replace(/[-_]/g, '');
          }
        }
      });

      // 提取 props 核心字段
      const propsMatch = fileContent.match(/props\s*[:=]\s*\{([^}]+)\}/);
      if (propsMatch?.[1]) {
        componentMeta.props = propsMatch[1].split(',').map(p => p.trim().split(':')[0]).filter(Boolean);
      }
    } catch (err) {
      console.warn(`解析组件 ${filePath} 失败：`, err.message);
      componentMeta.componentName = fileName.replace(ext, '');
    }
  }

  // Vue 组件解析
  if (ext === '.vue') {
    const scriptMatch = fileContent.match(/<script>([\s\S]+)<\/script>/);
    if (scriptMatch?.[1]) {
      const nameMatch = scriptMatch[1].match(/name\s*:\s*['"]([^'"]+)['"]/);
      if (nameMatch) componentMeta.componentName = nameMatch[1];
    }
    const templateMatch = fileContent.match(/<template>([\s\S]+)<\/template>/);
    if (templateMatch?.[1]) {
      if (templateMatch[1].includes('el-table') || templateMatch[1].includes('table')) {
        componentMeta.usageScene.push('数据展示', '表格渲染');
      }
      if (templateMatch[1].includes('el-button') || templateMatch[1].includes('button')) {
        componentMeta.usageScene.push('按钮触发', '表单提交');
      }
    }
  }

  // 构建特征摘要（用于向量化，核心检索依据）
  // 确保所有字段都有有效值
  const componentName = componentMeta.componentName || fileName.replace(ext, '') || '未命名组件';
  const description = componentMeta.description || '通用前端组件';
  const props = componentMeta.props.length > 0 ? componentMeta.props.join(', ') : '无';
  const usageScene = componentMeta.usageScene.length > 0 ? componentMeta.usageScene.join(', ') : '通用场景';
  
  componentMeta.featureSummary = [
    `组件名称：${componentName}`,
    `功能描述：${description}`,
    `入参：${props}`,
    `适用场景：${usageScene}`,
    `文件格式：${componentMeta.fileExt}`
  ].join('。');
  
  // 验证 featureSummary 不为空
  if (!componentMeta.featureSummary || componentMeta.featureSummary.trim().length === 0) {
    componentMeta.featureSummary = `组件名称：${componentName}。功能描述：前端组件。文件格式：${componentMeta.fileExt}`;
  }

  return componentMeta;
};

// 3. 向量库操作工具（基于 ChromaDB）
const { ChromaClient } = require('chromadb');
const chromaClient = new ChromaClient();
const EMBEDDING_MODEL_DIM = 384; // all-MiniLM-L6-v2 向量维度（后续向量化需匹配）

exports.getChromaCollection = async (collectionName) => {
  try {
    return await chromaClient.getCollection({ name: collectionName });
  } catch (err) {
    return await chromaClient.createCollection({
      name: collectionName,
      metadata: { description: '前端组件特征向量集合' }
    });
  }
};