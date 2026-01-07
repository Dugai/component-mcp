// 文件名：services/knowledgeBaseService.js
const fs = require('fs-extra');
const path = require('path');
const { scanComponentFiles, extractComponentMeta, getChromaCollection } = require('../utils');

// 全局配置
const KB_CONFIG = {
  metaDbPath: './mcp-knowledge/meta',
  vectorCollectionName: 'frontend-components-vector',
  embeddingModel: 'Xenova/all-MiniLM-L6-v2' // 轻量级嵌入模型（无大模型，仅做文本向量化）
};

// 全局嵌入模型管道（仅加载一次）
let embeddingPipeline = null;
let pipelineModule = null;

// 动态加载 ES6 模块
const loadPipeline = async () => {
  if (!pipelineModule) {
    const transformers = await import('@xenova/transformers');
    pipelineModule = transformers.pipeline;
  }
  return pipelineModule;
};

// 1. 初始化嵌入模型（用于文本向量化，无生成能力）
const initEmbeddingPipeline = async () => {
  if (!embeddingPipeline) {
    const pipeline = await loadPipeline();
    embeddingPipeline = await pipeline('feature-extraction', KB_CONFIG.embeddingModel, {
      pooling: 'mean',
      normalize: true
    });
  }
  return embeddingPipeline;
};

// 2. 文本向量化（无大模型，仅做特征提取）
const getTextEmbedding = async (text) => {
  const pipeline = await initEmbeddingPipeline();
  const output = await pipeline(text);
  return Array.from(output.data);
};

// 3. 初始化组件知识库（核心方法）
exports.initComponentKnowledgeBase = async (componentDir) => {
  try {
    // 步骤 1：创建目录并清空旧数据
    await fs.ensureDir(KB_CONFIG.metaDbPath);
    await fs.emptyDir(KB_CONFIG.metaDbPath);

    // 步骤 2：扫描并解析组件文件
    const componentFiles = await scanComponentFiles(componentDir);
    if (componentFiles.length === 0) {
      return { success: true, message: '未检测到有效组件，知识库初始化完成（空）', componentCount: 0 };
    }

    const componentMetas = [];
    for (const file of componentFiles) {
      const meta = await extractComponentMeta(file);
      componentMetas.push(meta);
      // 持久化元信息（不存储完整代码）
      await fs.writeJson(path.join(KB_CONFIG.metaDbPath, `${meta.id}.json`), meta, { spaces: 2 });
    }

    // 步骤 3：向量化并存入向量库
    const collection = await getChromaCollection(KB_CONFIG.vectorCollectionName);
    const ids = componentMetas.map(meta => meta.id);
    const documents = componentMetas.map(meta => meta.featureSummary);
    const metadatas = componentMetas.map(meta => ({
      componentName: meta.componentName,
      usageScene: meta.usageScene.join(','),
      fileExt: meta.fileExt
    }));

    // 批量生成向量
    const embeddings = [];
    for (const doc of documents) {
      embeddings.push(await getTextEmbedding(doc));
    }

    // 清空旧向量并添加新数据
    await collection.delete({ ids: await collection.get().then(res => res.ids) });
    await collection.add({ ids, documents, metadatas, embeddings });

    return {
      success: true,
      message: `知识库初始化成功`,
      componentCount: componentMetas.length,
      metaDbPath: KB_CONFIG.metaDbPath,
      vectorCollectionName: KB_CONFIG.vectorCollectionName
    };
  } catch (err) {
    return { success: false, message: '知识库初始化失败', error: err.message };
  }
};

// 4. RAG 组件检索（核心方法，无大模型生成）
exports.retrieveMatchedComponents = async (businessRequirement) => {
  try {
    // 步骤 1：校验知识库是否存在
    if (!await fs.pathExists(KB_CONFIG.metaDbPath)) {
      return { success: false, message: '知识库未初始化，请先执行初始化操作' };
    }

    // 步骤 2：文本向量化（检索关键词）
    const retrieveText = businessRequirement + '（核心需求：' + 
      businessRequirement.match(/(表格|分页|按钮|表单|弹窗|输入框|筛选|展示)/g)?.join(', ') || '' + '）';
    const queryEmbedding = await getTextEmbedding(retrieveText);

    // 步骤 3：向量库相似性检索
    const collection = await getChromaCollection(KB_CONFIG.vectorCollectionName);
    const searchResult = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 5, // 返回前5个最匹配结果
      where: {}
    });

    // 步骤 4：拼接组件元信息（不返回完整代码）
    const matchedComponents = [];
    for (const id of searchResult.ids[0] || []) {
      const metaPath = path.join(KB_CONFIG.metaDbPath, `${id}.json`);
      if (await fs.pathExists(metaPath)) {
        matchedComponents.push(await fs.readJson(metaPath));
      }
    }

    return {
      success: true,
      message: matchedComponents.length > 0 ? '检索到适配组件' : '未检索到适配组件',
      matchedComponents,
      hasMatch: matchedComponents.length > 0
    };
  } catch (err) {
    return { success: false, message: '组件检索失败', error: err.message };
  }
};

// 暴露配置
exports.KB_CONFIG = KB_CONFIG;