# 前端组件知识库 MCP 服务器

基于 LanceDB 和本地嵌入模型的前端组件知识库管理工具,支持 RAG 检索。

## 特性

- ✅ **完全本地运行** - 无需 API key,使用 `@xenova/transformers` 本地嵌入模型
- ✅ **嵌入式向量数据库** - 使用 LanceDB,无需启动额外服务
- ✅ **智能组件检索** - 基于语义相似度的 RAG 检索
- ✅ **MCP 协议支持** - 符合 Model Context Protocol 标准
- ✅ **多框架支持** - 支持 React、Vue、TypeScript 等组件解析

## 技术栈

- **向量数据库**: LanceDB (嵌入式)
- **嵌入模型**: Xenova/all-MiniLM-L6-v2 (本地运行)
- **MCP SDK**: @modelcontextprotocol/sdk
- **代码解析**: @babel/parser + @babel/traverse

## 安装


npm install


## 使用方法

### 1. 初始化知识库


node -e "require('./services/knowledgeBaseService-lancedb').initComponentKnowledgeBase('./components')"


### 2. 启动 MCP 服务器


node mcp-server.js


### 3. 使用工具

MCP 服务器提供两个工具:

#### `init_component_knowledge_base`
扫描组件目录,构建知识库


{
  "componentDir": "./components"
}


#### `retrieve_matched_components`
根据需求检索匹配的组件


{
  "businessRequirement": "我需要一个带分页的数据表格组件"
}


## 项目结构


component-mcp/
├── services/
│   ├── knowledgeBaseService.js          # ChromaDB 版本 (已弃用)
│   └── knowledgeBaseService-lancedb.js  # LanceDB 版本 (推荐)
├── utils/
│   └── index.js                         # 组件扫描和解析工具
├── mcp-server.js                        # MCP 服务器主文件
├── lancedb.js                           # LanceDB 使用示例
├── diagnose-nan.js                      # NaN 诊断工具
├── fix-nan.js                           # NaN 修复工具
└── inspect-lancedb.js                   # 数据库查看工具


## 工具脚本

### 诊断 NaN 问题

node diagnose-nan.js


### 修复 NaN 数据

node fix-nan.js


### 查看数据库内容

node inspect-lancedb.js


### 运行示例

node lancedb.js


## 配置

在 `services/knowledgeBaseService-lancedb.js` 中修改配置:


const DB_CONFIG = {
  dbPath: './lancedb-components',      // 向量数据库路径
  tableName: 'components',             // 表名
  metaDbPath: './mcp-knowledge/meta'   // 元数据存储路径
};


## 支持的组件类型

- React (.js, .jsx, .ts, .tsx)
- Vue (.vue)
- TypeScript (.ts, .tsx)

## 向量化模型

使用 `Xenova/all-MiniLM-L6-v2` 模型:
- 模型大小: ~22MB
- 向量维度: 384
- 支持中英文
- 完全本地运行

## 常见问题

### Q: 向量中出现 NaN 怎么办?
A: 运行 `node diagnose-nan.js` 诊断问题,然后运行 `node fix-nan.js` 修复。

### Q: 如何查看数据库中的数据?
A: 运行 `node inspect-lancedb.js` 查看所有数据。

### Q: 支持哪些编程语言?
A: 目前支持 JavaScript、TypeScript、JSX、TSX 和 Vue 文件。

## License

MIT
