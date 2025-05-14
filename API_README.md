# Simple Node.js API Server

一个使用 Node.js 和 Express 构建的轻量级 API 服务器。

## 开始使用

1. 安装依赖:

```bash
npm install
```

2. 运行 API 服务器:

```bash
npm run api
```

服务器将在 http://localhost:3001 上启动

## 可用端点

### GET /

返回一个简单的 "Hello World" 文本响应。

示例:

```bash
curl http://localhost:3001/
```

响应:

```
Hello World
```

### GET /api/hello

返回一个包含 "Hello World" 消息和时间戳的 JSON 响应。

示例:

```bash
curl http://localhost:3001/api/hello
```

响应:

```json
{
  "message": "Hello World",
  "timestamp": "2023-12-12T12:00:00.000Z"
}
```

## 开发

API 服务器使用 Express 构建。要修改服务器，编辑 `src/api.js` 文件。

你可以通过修改 `src/api.js` 中的路由处理函数来添加更多路由和功能。
