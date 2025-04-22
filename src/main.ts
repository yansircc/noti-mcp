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

// 启动服务器
server.start({
  transportType: "sse",
  sse: {
    endpoint: "/sse",
    port: 3000,
  },
});

console.log("FastMCP API 服务器已启动，运行在 http://localhost:3000");