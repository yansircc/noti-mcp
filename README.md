# MCP 工具开发脚手架

这是一个用于开发 Model Context Protocol (MCP) 工具的脚手架项目，基于 Node.js 运行时和 Express 框架构建。本项目提供了基础架构和示例工具，帮助开发者快速开始构建自己的 MCP 工具。

## 什么是 MCP？

Model Context Protocol (MCP) 是一种允许 AI 模型调用外部工具和服务的协议。通过 MCP，AI 可以执行各种操作，如发送邮件、推送通知、查询数据库等，从而扩展其能力范围。

## 脚手架特点

- 完整的 MCP 服务器实现，支持流式响应
- 基于 API 密钥的身份验证机制
- 工具注册和管理系统
- 包含 4 个示例工具（回显、邮件发送、微信通知、佣金计算器）供参考

## 快速开始

### 安装

```bash
# 克隆脚手架仓库
git clone <repository-url>
cd <repository-directory>

# 安装依赖
npm install
```

### 运行

```bash
# 开发模式，支持热重载
npm run dev

# 构建项目
npm run build

# 生产模式
npm run start
```

服务器将在指定端口上启动（默认为 3000）。

## MCP 工具开发指南

本脚手架的主要目的是帮助开发者快速开始构建自己的 MCP 工具。以下是开发自定义 MCP 工具的完整指南。

### MCP 工具的基本结构

一个 MCP 工具通常包含以下组件：

1. **参数模式（Schema）**：定义工具接受的参数及其验证规则
2. **实现逻辑**：执行工具功能的代码
3. **响应格式化**：将工具执行结果格式化为 MCP 兼容的响应

### 开发自定义 MCP 工具的步骤

#### 1. 创建工具定义文件

在 `src/tools/` 目录下创建一个新文件，例如 `src/tools/my-tool.ts`：

```typescript
import { z } from "zod";
import { formatToolResponse } from "../utils/response.js";

/**
 * 为工具参数定义 schema
 */
export const myToolSchema = z.object({
  // 定义您的工具需要的参数
  param1: z.string().min(1, "参数1不能为空"),
  param2: z.number().optional(),
  // 添加更多参数...
});

/**
 * 可选：为包含上下文信息的参数定义接口
 */
interface MyToolArgs extends z.infer<typeof myToolSchema> {
  apiKey?: string; // 如果您的工具需要 API 密钥
  // 其他上下文信息...
}

/**
 * 实现工具功能
 */
export async function myTool({ param1, param2, apiKey }: MyToolArgs) {
  try {
    console.log(`执行工具，参数1: ${param1}`);
    
    // 实现您的工具逻辑
    // 例如：调用外部 API、处理数据、执行计算等
    const result = await someOperation(param1, param2);
    
    // 返回成功响应
    return formatToolResponse(`操作成功: ${result}`);
  } catch (error) {
    console.error("工具执行错误:", error);
    return formatToolResponse(
      `执行失败: ${error instanceof Error ? error.message : String(error)}`,
      true // 标记为错误
    );
  }
}

// 辅助函数示例
async function someOperation(param1: string, param2?: number) {
  // 实现具体操作...
  return "操作结果";
}
```

#### 2. 在工具注册器中注册您的工具

修改 `src/services/tools-registry.ts` 文件，导入并注册您的新工具：

```typescript
// 添加导入
import { myTool, myToolSchema } from "../tools/my-tool.js";

export function registerTools(server: McpServer, req: Request): void {
  const { sendKey, scKey } = extractApiKeys(req);
  
  // 其他工具注册...

  // 注册您的自定义工具
  server.tool(
    "my-tool", // 工具名称（AI 将用此名称调用工具）
    "这是我的工具描述", // 工具描述（帮助 AI 理解工具用途）
    myToolSchema.shape, // 参数 schema
    async (args: z.infer<typeof myToolSchema>) => myTool({ 
      ...args, 
      apiKey: sendKey // 或其他上下文信息
    })
  );
}
```

### MCP 工具开发最佳实践

#### 工具设计原则

1. **单一职责**：每个工具应专注于完成一个特定任务
2. **简单明了**：工具名称和描述应清晰表达其功能
3. **可组合性**：工具应易于与其他工具组合使用
4. **错误处理**：妥善处理所有可能的错误情况
5. **安全性**：不暴露敏感信息，谨慎处理认证凭据

#### 参数验证

- 使用 Zod 库定义严格的参数 schema
- 对所有必填参数进行类型和值的验证
- 为验证错误提供明确的错误消息
- 考虑参数的边界条件和特殊情况

```typescript
// 良好的参数验证示例
export const userToolSchema = z.object({
  userId: z.string().uuid("用户ID必须是有效的UUID"),
  action: z.enum(["create", "update", "delete"], {
    errorMap: () => ({ message: "操作必须是 create、update 或 delete" })
  }),
  data: z.record(z.string(), z.any()).optional(),
  limit: z.number().int().positive().optional(),
});
```

#### 错误处理

- 使用 try/catch 块捕获所有可能的错误
- 区分不同类型的错误（验证错误、API 错误、网络错误等）
- 记录详细的错误信息以便调试
- 向用户返回有帮助的错误消息

```typescript
try {
  // 操作代码...
} catch (error) {
  if (error instanceof NetworkError) {
    console.error("网络错误:", error);
    return formatToolResponse("连接服务失败，请检查网络", true);
  } else if (error instanceof ValidationError) {
    console.error("验证错误:", error);
    return formatToolResponse(`输入数据无效: ${error.message}`, true);
  } else {
    console.error("未知错误:", error);
    return formatToolResponse("发生未预期的错误", true);
  }
}
```

#### 日志记录

- 记录工具的调用信息和参数（注意不要记录敏感数据）
- 使用不同的日志级别（info、warning、error）
- 在生产环境中控制日志的详细程度
- 记录响应时间和性能指标

```typescript
console.info(`开始执行工具 ${toolName}，参数:`, sanitizeParams(args));
const startTime = Date.now();

// 工具逻辑...

const duration = Date.now() - startTime;
console.info(`工具 ${toolName} 执行完成，耗时: ${duration}ms`);
```

#### 响应格式化

- 使用一致的响应格式
- 提供结构化和易于理解的结果
- 对于复杂数据，考虑如何最好地呈现给AI和用户
- 明确区分成功和错误响应

```typescript
// 成功响应示例
return {
  content: [
    { type: "text", text: "操作成功" },
    { 
      type: "json", 
      json: { 
        id: result.id,
        status: result.status,
        timestamp: new Date().toISOString()
      } 
    }
  ],
  isError: false
};

// 错误响应示例
return {
  content: [{ type: "text", text: `操作失败: ${errorMessage}` }],
  isError: true
};
```

### 高级开发技巧

#### 1. 工具链式调用

设计工具时考虑它们如何协同工作，一个工具的输出可以作为另一个工具的输入。

#### 2. 上下文共享

通过请求对象传递上下文信息（如API密钥、用户信息等）。

#### 3. 流式响应

对于长时间运行的操作，考虑使用流式响应提供进度更新。

#### 4. 缓存策略

对频繁请求的数据实现缓存，提高性能并减少外部API调用。

#### 5. 超时和重试逻辑

对外部API调用实现超时和重试逻辑，提高可靠性。

```typescript
async function callWithRetry(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`尝试 ${i+1}/${maxRetries} 失败:`, error);
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // 指数退避
    }
  }
  throw lastError;
}
```

## 示例工具参考

本脚手架包含四个示例工具，您可以参考它们的实现来开发自己的工具：

### 1. Echo 工具 (简单示例)

一个简单的回显工具，接收消息并返回相同的消息。

```typescript
// src/tools/echo.ts
import { z } from "zod";
import { formatToolResponse } from "../utils/response.js";

export const echoSchema = z.object({
  message: z.string(),
});

export async function echo(args: z.infer<typeof echoSchema>) {
  return formatToolResponse(`Tool echo: ${args.message}`);
}
```

### 2. 发送电子邮件工具 (API调用示例)

展示如何调用外部API发送电子邮件的示例。

```typescript
// src/tools/send-email.ts (简化版)
import { z } from "zod";
import { formatToolResponse } from "../utils/response.js";

export const emailSchema = z.object({
  to: z.string().email("必须是有效的电子邮件地址"),
  subject: z.string().min(1, "主题不能为空"),
  body: z.string().min(1, "邮件正文不能为空"),
});

interface SendEmailArgs extends z.infer<typeof emailSchema> {
  apiKey: string;
}

export async function sendEmail({ to, subject, body, apiKey }: SendEmailArgs) {
  // 实现电子邮件发送逻辑...
  return formatToolResponse("电子邮件发送成功");
}
```

### 3. 微信通知工具 (错误处理示例)

展示如何处理外部API响应和错误情况的示例。

```typescript
// src/tools/wechat-push.ts (简化版)
import { z } from "zod";
import { formatToolResponse } from "../utils/response.js";

export const wechatPushSchema = z.object({
  title: z.string(),
  description: z.string(),
});

interface WechatPushArgs extends z.infer<typeof wechatPushSchema> {
  apiKey: string;
}

export async function sendWechatNotification({ title, description, apiKey }: WechatPushArgs) {
  try {
    // 调用外部API发送通知...
    
    // 处理响应...
    if (success) {
      return formatToolResponse("微信通知发送成功");
    } else {
      return formatToolResponse(`发送失败: ${errorMessage}`, true);
    }
  } catch (error) {
    return formatToolResponse(`发送错误: ${error.message}`, true);
  }
}
```

### 4. 佣金计算器工具 (数据处理示例)

展示如何处理数据计算和结果格式化的示例。

```typescript
// src/tools/commission-calculator.ts (简化版)
import { z } from "zod";
import { formatToolResponse } from "../utils/response.js";

export const commissionSchema = z.object({
  profit: z.number().min(0, "利润必须是非负数"),
});

export async function commissionCalculator({ profit }: z.infer<typeof commissionSchema>) {
  try {
    // 计算佣金和税收...
    
    // 返回格式化结果
    return formatToolResponse(`利润${profit}元的收入计算结果: ...`);
  } catch (error) {
    return formatToolResponse(`计算失败: ${error.message}`, true);
  }
}
```

## 测试您的工具

使用 cURL 或 Postman 向 `/mcp` 端点发送请求来测试您的工具：

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-send-key: sk_your_key" \
  -H "mcp-sc-key: SC_your_key" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tool",
    "params": {
      "tool": "my-tool",
      "arguments": {
        "param1": "测试值",
        "param2": 123
      }
    },
    "id": "test-1"
  }'
```

## 贡献指南

我们欢迎您为这个MCP工具开发脚手架做出贡献！请参考以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request
