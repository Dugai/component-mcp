const lancedb = require('@lancedb/lancedb');
const fs = require('fs-extra');
const path = require('path');

let embeddingPipeline = null;

const loadEmbeddingModel = async () => {
  if (!embeddingPipeline) {
    const transformers = await import('@xenova/transformers');
    embeddingPipeline = await transformers.pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      { pooling: 'mean', normalize: true }
    );
  }
  return embeddingPipeline;
};

// 文本向量化（增加输入验证和 NaN 检查）
const textToVector = async (text) => {
  // 验证输入
  if (!text || typeof text !== 'string') {
    console.warn('⚠️  无效的输入文本:', text);
    text = '默认文本'; // 使用默认文本
  }
  
  // 清理文本
  text = text.trim();
  if (text.length === 0) {
    console.warn('⚠️  空文本，使用默认值');
    text = '未知组件';
  }
  
  // 限制文本长度（避免过长文本导致问题）
  if (text.length > 5000) {
    console.warn('⚠️  文本过长，截断到 5000 字符');
    text = text.substring(0, 5000);
  }
  
  try {
    const model = await loadEmbeddingModel();
    const output = await model(text);
    const vector = Array.from(output.data);
    
    // 检查 NaN
    const hasNaN = vector.some(v => isNaN(v) || !isFinite(v));
    if (hasNaN) {
      console.error('❌ 向量包含 NaN 或 Infinity');
      console.error('   输入文本:', text.substring(0, 100));
      console.error('   向量样本:', vector.slice(0, 10));
      
      // 替换 NaN 为 0
      return vector.map(v => (isNaN(v) || !isFinite(v)) ? 0 : v);
    }
    
    return vector;
  } catch (error) {
    console.error('❌ 向量化失败:', error.message);
    console.error('   输入文本:', text.substring(0, 100));
    throw error;
  }
};

// LanceDB 配置
const DB_CONFIG = {
  dbPath: './lancedb-components',
  tableName: 'components',
  metaDbPath: './mcp-knowledge/meta'
};

// 初始化组件知识库（使用 LanceDB）
exports.initComponentKnowledgeBase = async (componentDir) => {
  try {
    const { scanComponentFiles, extractComponentMeta } = require('../utils');
    
    // 步骤 1：创建目录并清空旧数据
    await fs.ensureDir(DB_CONFIG.metaDbPath);
    await fs.emptyDir(DB_CONFIG.metaDbPath);

    const componentFiles = await scanComponentFiles(componentDir);
    
    if (componentFiles.length === 0) {
      return { 
        success: true, 
        message: '未检测到有效组件，知识库初始化完成（空）', 
        componentCount: 0 
      };
    }

    const componentMetas = [];
    for (const file of componentFiles) {
      const meta = await extractComponentMeta(file);
      componentMetas.push(meta);
      // 持久化元信息
      await fs.writeJson(
        path.join(DB_CONFIG.metaDbPath, `${meta.id}.json`), 
        meta, 
        { spaces: 2 }
      );
    }
    
    const db = await lancedb.connect(DB_CONFIG.dbPath);
    
    // 删除旧表
    const tableNames = await db.tableNames();
    if (tableNames.includes(DB_CONFIG.tableName)) {
      await db.dropTable(DB_CONFIG.tableName);
    }
    
    // 为每个组件生成向量
    const dataWithVectors = [];
    for (let i = 0; i < componentMetas.length; i++) {
      const meta = componentMetas[i];
      console.log(meta.featureSummary, '特征')
      const vector = await textToVector(meta.featureSummary);

      console.log('向量：', vector)
      
      dataWithVectors.push({
        id: meta.id,
        componentName: meta.componentName,
        fileName: meta.fileName,
        relativePath: meta.relativePath,
        fileExt: meta.fileExt,
        usageScene: meta.usageScene.join(','),
        featureSummary: meta.featureSummary,
        vector: vector
      });
      
      if ((i + 1) % 5 === 0 || i === componentMetas.length - 1) {
        console.log(`  进度: ${i + 1}/${componentMetas.length}`);
      }
    }
    
    // 创建表
    await db.createTable(DB_CONFIG.tableName, dataWithVectors);
    console.log('✓ 向量数据已存入 LanceDB');

    // 打开表并查看数据
    const table = await db.openTable(DB_CONFIG.tableName);
    
    // 获取表的行数
    const rowCount = await table.countRows();
    console.log(`✓ 表中共有 ${rowCount} 条记录`);
    
    // 查看前3条数据（不显示向量）
    console.log('\n=== 数据预览 (前3条) ===');
    const preview = await table.query().limit(3).toArray();
    preview.forEach((row, i) => {
      console.log(`\n${i + 1}. ${row.componentName || '未命名'} (${row.fileName})`);
      console.log(`   ID: ${row.id}`);
      console.log(`   路径: ${row.relativePath}`);
      console.log(`   类型: ${row.fileExt}`);
      console.log(`   场景: ${row.usageScene || '无'}`);
      console.log(`   摘要: ${row.featureSummary.substring(0, 80)}...`);
      //console.log(`   向量维度: ${row.vector ? row.vector : 0}`);
    });
    
    // 查看所有组件名称列表
    console.log('\n=== 所有组件列表 ===');
    const allComponents = await table.query().select(['componentName', 'fileName']).toArray();
    allComponents.forEach((row, i) => {
      console.log(`${i + 1}. ${row.componentName || row.fileName}`);
    });
    
    return {
      success: true,
      message: '知识库初始化成功',
      componentCount: componentMetas.length,
      metaDbPath: DB_CONFIG.metaDbPath,
      dbPath: DB_CONFIG.dbPath
    };
    
  } catch (err) {
    console.error('❌ 知识库初始化失败:', err);
    return { 
      success: false, 
      message: '知识库初始化失败', 
      error: err.message 
    };
  }
};

exports.initComponentKnowledgeBase('/Users/xyz/Documents/beke-item/component-mcp/components')

// RAG 组件检索（使用 LanceDB）
exports.retrieveMatchedComponents = async (businessRequirement) => {
  try {
    
    // 步骤 1：校验知识库是否存在
    if (!await fs.pathExists(DB_CONFIG.metaDbPath)) {
      return { 
        success: false, 
        message: '知识库未初始化，请先执行初始化操作' 
      };
    }
    
    // 步骤 2：连接数据库
    const db = await lancedb.connect(DB_CONFIG.dbPath);
    const tableNames = await db.tableNames();
    
    if (!tableNames.includes(DB_CONFIG.tableName)) {
      return { 
        success: false, 
        message: '组件表不存在，请重新初始化知识库' 
      };
    }
    
    const table = await db.openTable(DB_CONFIG.tableName);
    
    // 步骤 3：查询向量化
    console.log('⏳ 生成查询向量...');
    const queryVector = await textToVector(businessRequirement);
    
    // 步骤 4：向量搜索
    console.log('⏳ 搜索匹配组件...');
    const searchResults = await table
      .search(queryVector)
      .limit(5)
      .toArray();
    
    // 步骤 5：加载完整的组件元信息
    const matchedComponents = [];
    for (const result of searchResults) {
      const metaPath = path.join(DB_CONFIG.metaDbPath, `${result.id}.json`);
      if (await fs.pathExists(metaPath)) {
        const meta = await fs.readJson(metaPath);
        matchedComponents.push({
          ...meta,
          similarity: (1 / (1 + result._distance)).toFixed(4), // 转换为相似度分数
          distance: result._distance
        });
      }
    }
    
    console.log(`✓ 找到 ${matchedComponents.length} 个匹配组件`);
    
    return {
      success: true,
      message: matchedComponents.length > 0 ? '检索到适配组件' : '未检索到适配组件',
      matchedComponents,
      hasMatch: matchedComponents.length > 0,
      query: businessRequirement
    };
    
  } catch (err) {
    console.error('❌ 组件检索失败:', err);
    return { 
      success: false, 
      message: '组件检索失败', 
      error: err.message 
    };
  }
};

// 暴露配置
exports.DB_CONFIG = DB_CONFIG;