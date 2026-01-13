const lancedb = require("@lancedb/lancedb");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// LanceDB 配置
const DB_CONFIG = {
  dbPath: "./lancedb-components",
  tableName: "components",
  metaDbPath: "./mcp-knowledge/meta",
};

// 嵌入接口配置
const EMBEDDING_API_CONFIG = {
  url: "https://openapi-ait.ke.com/v1/embeddings",
  headers: {
    Accept: "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    Connection: "keep-alive",
    "Content-Type": "application/json;charset=utf-8",
    "x-requested-with": "XMLHttpRequest",
    Authorization: "Bearer 60f4ae60-ae49-42fc-9cbb-2886b14ed701",
  },
  model: "text-embedding-ada-002",
  encoding_format: "float",
};

// 增强版限流配置
const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 5, // 每分钟最大请求数
  BASE_INTERVAL: 12000, // 基础间隔12秒（60/5）
  SAFETY_MARGIN: 1000, // 安全裕量1秒，避免时间计算误差
  MAX_RETRY: 3, // 429错误最大重试次数
  RETRY_DELAY_MULTIPLIER: 2, // 重试延迟倍数（指数退避）
  INITIAL_RETRY_DELAY: 15000, // 首次重试延迟15秒
};

// 全局状态管理
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let requestQueue = []; // 请求队列
let isProcessingQueue = false; // 是否正在处理队列
let requestTimestamps = []; // 记录最近1分钟的请求时间戳

/**
 * 清理过期的时间戳（超过1分钟的）
 */
const cleanExpiredTimestamps = () => {
  const oneMinuteAgo = Date.now() - 60 * 1000;
  requestTimestamps = requestTimestamps.filter((ts) => ts > oneMinuteAgo);
};

/**
 * 计算需要等待的时间（确保每分钟不超过5次）
 */
const calculateWaitTime = () => {
  cleanExpiredTimestamps();

  // 如果请求数不足5个，返回基础间隔+安全裕量
  if (requestTimestamps.length < RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
    const lastRequestTime =
      requestTimestamps[requestTimestamps.length - 1] || 0;
    const timeSinceLast = Date.now() - lastRequestTime;
    const requiredWait =
      RATE_LIMIT.BASE_INTERVAL + RATE_LIMIT.SAFETY_MARGIN - timeSinceLast;
    return Math.max(0, requiredWait);
  }

  // 如果已达5次，等待到最早的请求超过1分钟
  const earliestRequest = requestTimestamps[0];
  const waitUntil = earliestRequest + 60 * 1000 + RATE_LIMIT.SAFETY_MARGIN;
  return Math.max(0, waitUntil - Date.now());
};

/**
 * 增强版嵌入接口调用 - 带严格限流和重试
 * @param {string} text 待嵌入文本
 * @param {number} retryCount 当前重试次数
 */
const callEmbeddingAPI = async (text, retryCount = 0) => {
  // 输入验证（保留原有逻辑）
  if (!text || typeof text !== "string") {
    console.warn("⚠️  无效的输入文本，使用默认值");
    text = "默认文本";
  }
  text = text.trim();
  if (text.length === 0) text = "未知组件";
  if (text.length > 5000) {
    console.warn("⚠️  文本过长，截断到5000字符");
    text = text.substring(0, 5000);
  }

  // 使用队列确保串行执行
  return new Promise(async (resolve) => {
    // 将请求加入队列
    requestQueue.push({ text, resolve, retryCount });

    // 如果队列未处理，开始处理
    if (!isProcessingQueue) {
      isProcessingQueue = true;

      while (requestQueue.length > 0) {
        const currentReq = requestQueue[0];
        const {
          text: reqText,
          resolve: reqResolve,
          retryCount: reqRetry,
        } = currentReq;

        try {
          // 1. 计算并等待限流时间
          const waitTime = calculateWaitTime();
          if (waitTime > 0) {
            console.log(`⏳ 限流等待 ${(waitTime / 1000).toFixed(1)} 秒...`);
            await sleep(waitTime);
          }

          // 2. 调用嵌入接口
          const response = await axios.post(
            EMBEDDING_API_CONFIG.url,
            {
              input: reqText,
              model: EMBEDDING_API_CONFIG.model,
              encoding_format: EMBEDDING_API_CONFIG.encoding_format,
            },
            {
              headers: EMBEDDING_API_CONFIG.headers,
              timeout: 30000,
            }
          );

          // 3. 记录请求时间戳
          requestTimestamps.push(Date.now());

          // 4. 解析向量
          if (response.data?.data?.length > 0) {
            const embedding = response.data.data[0].embedding;
            // 验证向量有效性
            if (embedding.some((v) => isNaN(v) || !isFinite(v))) {
              throw new Error("向量包含无效值（NaN/Infinity）");
            }
            reqResolve(embedding);
          } else {
            throw new Error("接口返回无向量数据");
          }
        } catch (error) {
          // 处理429限流错误
          if (
            error.response?.status === 429 &&
            reqRetry < RATE_LIMIT.MAX_RETRY
          ) {
            const retryDelay =
              RATE_LIMIT.INITIAL_RETRY_DELAY *
              Math.pow(RATE_LIMIT.RETRY_DELAY_MULTIPLIER, reqRetry);
            console.error(
              `❌ 触发429限流，将在 ${(retryDelay / 1000).toFixed(
                1
              )} 秒后重试（${reqRetry + 1}/${RATE_LIMIT.MAX_RETRY}）`
            );

            // 等待后重新加入队列
            await sleep(retryDelay);
            requestQueue[0] = {
              text: reqText,
              resolve: reqResolve,
              retryCount: reqRetry + 1,
            };
            continue; // 跳过出队，重新处理当前请求
          }

          // 其他错误或重试用尽
          console.error(
            `❌ 嵌入接口调用失败（重试${reqRetry}次）:`,
            error.message
          );
        }

        // 处理完成，移出队列
        requestQueue.shift();
      }

      // 队列为空，重置状态
      isProcessingQueue = false;
    }
  });
};

// 初始化组件知识库
exports.initComponentKnowledgeBase = async (componentDir) => {
  try {
    const { scanComponentFiles, extractComponentMeta } = require("./utils");

    // 步骤1：初始化目录
    await fs.ensureDir(DB_CONFIG.metaDbPath);
    await fs.emptyDir(DB_CONFIG.metaDbPath);

    const componentFiles = await scanComponentFiles(componentDir);
    if (componentFiles.length === 0) {
      return { success: true, message: "未检测到有效组件", componentCount: 0 };
    }

    // 步骤2：提取组件元信息
    const componentMetas = [];
    for (const file of componentFiles) {
      try {
        const meta = await extractComponentMeta(file);
        componentMetas.push(meta);
        await fs.writeJson(
          path.join(DB_CONFIG.metaDbPath, `${meta.id}.json`),
          meta,
          { spaces: 2 }
        );
      } catch (e) {
        console.warn(`⚠️  提取${file}元信息失败:`, e.message);
      }
    }

    if (componentMetas.length === 0) {
      return {
        success: true,
        message: "组件元信息提取失败",
        componentCount: 0,
      };
    }

    // 步骤3：连接LanceDB
    const db = await lancedb.connect(DB_CONFIG.dbPath);
    if ((await db.tableNames()).includes(DB_CONFIG.tableName)) {
      await db.dropTable(DB_CONFIG.tableName);
    }

    // 步骤4：生成向量（修复只处理1个组件的问题）
    console.log(`🔄 开始为 ${componentMetas.length} 个组件生成向量...`);
    const dataWithVectors = [];
    for (let i = 0; i < componentMetas.length; i++) {
      const meta = componentMetas[i];
      console.log(
        `🔹 处理组件 ${i + 1}/${componentMetas.length}: ${meta.componentName}`
      );

      const vector = await callEmbeddingAPI(meta.featureSummary);
      dataWithVectors.push({
        id: meta.id,
        componentName: meta.componentName,
        fileName: meta.fileName,
        relativePath: meta.relativePath,
        fileExt: meta.fileExt,
        usageScene: meta.usageScene.join(","),
        featureSummary: meta.featureSummary,
        vector: vector,
      });
    }

    // 步骤5：创建表
    await db.createTable(DB_CONFIG.tableName, dataWithVectors);

    // 步骤6：测试搜索（修复queryVector未定义）
    const table = await db.openTable(DB_CONFIG.tableName);
    const queryVector = await callEmbeddingAPI("选择日期组件"); // 取消注释并定义变量
    const searchResults = await table.search(queryVector).limit(2).toArray();

    console.log(`✅ 知识库初始化完成，共处理 ${componentMetas.length} 个组件`);
    return {
      success: true,
      message: "知识库初始化成功",
      componentCount: componentMetas.length,
      metaDbPath: DB_CONFIG.metaDbPath,
      dbPath: DB_CONFIG.dbPath,
    };
  } catch (err) {
    console.error("❌ 知识库初始化失败:", err);
    return {
      success: false,
      message: "知识库初始化失败",
      error: err.message,
    };
  }
};

// RAG组件检索（修复queryVector未定义）
exports.retrieveMatchedComponents = async (businessRequirement) => {
  try {
    // 入参校验
    if (!businessRequirement || typeof businessRequirement !== "string") {
      return { success: false, message: "业务需求不能为空且必须是字符串" };
    }

    // 校验知识库
    if (!(await fs.pathExists(DB_CONFIG.metaDbPath))) {
      return { success: false, message: "知识库未初始化" };
    }

    // 连接数据库
    const db = await lancedb.connect(DB_CONFIG.dbPath);
    const tableNames = await db.tableNames();
    if (!tableNames.includes(DB_CONFIG.tableName)) {
      return { success: false, message: "组件表不存在" };
    }

    const table = await db.openTable(DB_CONFIG.tableName);

    // 生成查询向量（取消注释并定义变量）
    const queryVector = await callEmbeddingAPI(businessRequirement);

    // 向量搜索
    const searchResults = await table.search(queryVector).limit(5).toArray();

    // 加载完整元信息
    const matchedComponents = [];
    for (const result of searchResults) {
      try {
        const metaPath = path.join(DB_CONFIG.metaDbPath, `${result.id}.json`);
        if (await fs.pathExists(metaPath)) {
          const meta = await fs.readJson(metaPath);
          matchedComponents.push({
            ...meta,
            similarity: (1 / (1 + result._distance)).toFixed(4),
            distance: result._distance,
          });
        }
      } catch (e) {
        console.warn(`⚠️  加载${result.id}元信息失败:`, e.message);
      }
    }

    return {
      success: true,
      message:
        matchedComponents.length > 0 ? "检索到适配组件" : "未检索到适配组件",
      matchedComponents,
      hasMatch: matchedComponents.length > 0,
      query: businessRequirement,
    };
  } catch (err) {
    console.error("❌ 组件检索失败:", err);
    return {
      success: false,
      message: "组件检索失败",
      error: err.message,
    };
  }
};

// 暴露配置
exports.DB_CONFIG = DB_CONFIG;
exports.EMBEDDING_API_CONFIG = EMBEDDING_API_CONFIG;

// 初始化调用（建议用异步包装避免顶层await问题）
(async () => {
  // const result = await exports.initComponentKnowledgeBase(
  //   "/Users/xyz/Documents/beke-item/component-mcp/components"
  // );
  // console.log("初始化结果:", result);
  await exports.retrieveMatchedComponents("生成一个日期组件");
})();
