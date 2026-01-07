// 文件名：mcp-server.js
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { initComponentKnowledgeBase, retrieveMatchedComponents } = require('./services/knowledgeBaseService');

// 定义工具的参数 schema
const InitKnowledgeBaseArgsSchema = {
  componentDir: z.string().describe('前端项目 components 文件夹路径（绝对路径或相对路径）')
};

const RetrieveComponentArgsSchema = {
  businessRequirement: z.string().describe('业务组件需求描述（如「带分页的商机列表表格组件」）')
};

class ComponentMcpServer {
  constructor() {
    this.server = new McpServer(
      {
        name: "frontend-component-mcp",
        version: "1.0.0",
        description: "前端组件知识库管理 MCP 工具（无内置大模型，支持 RAG 检索组件）"
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupTools();
  }

  setupTools() {
    // 工具 1：初始化组件知识库
    this.server.tool(
      "init_component_knowledge_base",
      "扫描前端项目 components 文件夹，构建组件知识库（仅存储核心元信息，不存储完整代码）",
      InitKnowledgeBaseArgsSchema,
      async (args) => {
        try {
          const result = await initComponentKnowledgeBase(args.componentDir);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `初始化知识库失败: ${error instanceof Error ? error.message : String(error)}`
              }
            ]
          };
        }
      }
    );

    // 工具 2：检索适配组件
    this.server.tool(
      "retrieve_matched_components",
      "根据业务需求从知识库检索适配组件，无匹配则返回空结果",
      RetrieveComponentArgsSchema,
      async (args) => {
        try {
          const result = await retrieveMatchedComponents(args.businessRequirement);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `检索组件失败: ${error instanceof Error ? error.message : String(error)}`
              }
            ]
          };
        }
      }
    );
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('服务启动成功...')
  }
}

// 启动服务器
const server = new ComponentMcpServer();
server.start().catch((error) => {
  console.error("服务启动失败:", error);
  process.exit(1);
});
