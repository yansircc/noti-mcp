import { FastMCP } from "fastmcp";
import { z } from "zod";

// 创建 FastMCP 实例
const server = new FastMCP({
  name: "My Server",
  version: "1.0.0"
});

// 添加一个简单的工具示例
server.addTool({
  name: "hello",
  description: "返回 Hello World 消息",
  parameters: z.object({}),
  execute: async () => {
    return "Hello World";
  },
});

// 添加带参数的工具示例
server.addTool({
  name: "add",
  description: "将两个数字相加",
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async (args) => {
    return String(args.a + args.b);
  },
});

// 获取端口配置（优先使用 WEB_PORT 环境变量，其次是 PORT，最后默认值为 3000）
const PORT = process.env.WEB_PORT || process.env.PORT || 3000;

// 启动服务器
server.start({
  transportType: "sse",
  sse: {
    endpoint: "/sse",
    port: Number(PORT),
  },
});

console.log(`FastMCP API 服务器已启动，运行在 http://localhost:${PORT}/sse`);
console.log(`如果在 Docker 中运行，可通过 http://0.0.0.0:${PORT}/sse 访问`);