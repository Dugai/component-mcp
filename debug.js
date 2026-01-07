// 文件名：mcp-server.js（修正后）
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { initComponentKnowledgeBase, retrieveMatchedComponents } = require('./services/knowledgeBaseService');

// 修正：schema 必须是 z.object() 实例（原代码是普通对象，校验无效）
const InitKnowledgeBaseArgsSchema = z.object({
  componentDir: z.string().describe('前端项目 components 文件夹路径（绝对路径或相对路径）')
});

const RetrieveComponentArgsSchema = z.object({
  businessRequirement: z.string().describe('业务组件需求描述（如「带分页的商机列表表格组件」）')
});

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

    // 新增：实例属性，缓存工具的 schema 和 handler（避免访问私有属性 _tools）
    this.toolCache = new Map(); // 结构：key=工具名，value={ schema, handler }
    this.setupTools();
  }

  setupTools() {
    // 工具 1：初始化组件知识库
    const initToolHandler = async (args) => {
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
    };

    // 注册工具 + 缓存到 toolCache
    this.server.tool(
      "init_component_knowledge_base",
      "扫描前端项目 components 文件夹，构建组件知识库（仅存储核心元信息，不存储完整代码）",
      InitKnowledgeBaseArgsSchema,
      initToolHandler
    );
    this.toolCache.set("init_component_knowledge_base", {
      schema: InitKnowledgeBaseArgsSchema,
      handler: initToolHandler
    });

    // 工具 2：检索适配组件
    const retrieveToolHandler = async (args) => {
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
    };

    // 注册工具 + 缓存到 toolCache
    this.server.tool(
      "retrieve_matched_components",
      "根据业务需求从知识库检索适配组件，无匹配则返回空结果",
      RetrieveComponentArgsSchema,
      retrieveToolHandler
    );
    this.toolCache.set("retrieve_matched_components", {
      schema: RetrieveComponentArgsSchema,
      handler: retrieveToolHandler
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('服务启动成功...');
  }

  // 修正：调试方法——从 toolCache 中获取工具，避免访问私有属性 _tools
  async debugTool(toolName, args) {
    console.log(`\n--- 开始调试工具：${toolName} ---`);
    try {
      // 1. 从缓存中获取工具（不再访问 this.server._tools）
      const tool = this.toolCache.get(toolName);
      if (!tool) {
        throw new Error(`工具 ${toolName} 未注册（缓存中不存在）`);
      }

      // 2. 校验参数（使用缓存的 schema）
      const validArgs = tool.schema.parse(args);

      // 3. 执行工具的核心逻辑（使用缓存的 handler）
      const result = await tool.handler(validArgs);

      // 4. 输出结果
      console.log(`✅ 工具 ${toolName} 执行成功：`);
      console.log(result.content[0].text);
      return result;
    } catch (error) {
      console.error(`❌ 工具 ${toolName} 执行失败：`);
      console.error(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}

// 启动服务器 + 调试逻辑
const runServerAndDebug = async () => {
  const server = new ComponentMcpServer();

  // 可选：跳过启动 MCP 服务，仅调试工具
  // await server.start();

  // 第二步：手动调用调试工具
  console.log("=============== 开始调试 MCP 内置工具 ===============");
  try {
    // 调试「初始化知识库」工具（替换为你的实际组件路径）
    await server.debugTool("init_component_knowledge_base", {
      componentDir: "./my-frontend-project/components"
    });

    // 调试「检索组件」工具（替换为你的实际业务需求）
    await server.debugTool("retrieve_matched_components", {
      businessRequirement: "带搜索框和分页的商机列表表格组件"
    });

    console.log("\n=============== 内置工具调试完成 ===============");
  } catch (error) {
    console.error("\n=============== 内置工具调试失败 ===============");
    console.error(error);
    process.exit(1);
  }
};

// 启动调试
runServerAndDebug();