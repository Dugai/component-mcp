const lancedb = require("@lancedb/lancedb");
require("@lancedb/lancedb/embedding/openai");
const { LanceSchema, getRegistry } = require("@lancedb/lancedb/embedding");
const { Utf8 } = require("apache-arrow");

console.log(lancedb.openTable, '哈哈哈哈')


let embeddingPipeline = null;

const loadEmbeddingModel = async () => {
  if (!embeddingPipeline) {
    const transformers = await import('@xenova/transformers');
    console.log('⏳ 加载本地嵌入模型...');
    embeddingPipeline = await transformers.pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      { pooling: 'mean', normalize: true }
    );
    console.log('✅ 嵌入模型加载完成');
  }
  return embeddingPipeline;
};

// 文本向量化
const textToVector = async (text) => {
  const model = await loadEmbeddingModel();
  const output = await model(text);
  return Array.from(output.data);
};

// 使用立即执行函数来处理异步操作
(async () => {
  await loadEmbeddingModel()

  // 连接到 LanceDB 数据库
  const databaseDir = "path/to/your/database"; // 替换为你的数据库路径
  const db = await lancedb.connect(databaseDir);


  // 定义数据表的模式
  // const wordsSchema = LanceSchema({
  //   text: func.sourceField(new Utf8()), // 定义文本字段
  //   vector: func.vectorField(), // 定义向量字段
  // });

  // // 创建一个空表用于存储文本和向量
  // const tbl = await db.createEmptyTable("words", wordsSchema, {
  //   mode: "overwrite", // 如果表已存在则覆盖
  // });

  // // 添加数据到表中
  // await tbl.add([{ text: "hello world" }, { text: "goodbye world" }]);

  // 查询相似文本
  const query = "greetings";
  // const actual = (await tbl.search(query).limit(1).toArray())[0];

  console.log(textToVector(query).then(data => console.log(data)), '向量化')

  // 输出查询结果
})();
