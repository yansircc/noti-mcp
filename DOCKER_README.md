# FastMCP Docker 部署指南

本文档介绍如何使用 Docker 部署 FastMCP 服务。

## 前提条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/) (可选，但推荐)

## 使用 Docker Compose 部署（推荐）

1. 确保 `docker-compose.yml` 文件和 `Dockerfile` 位于项目根目录
2. 在项目根目录下执行以下命令启动服务：

```bash
docker-compose up -d
```

这将在后台构建并启动 FastMCP 服务。服务将在 `http://localhost:3000/sse` 上可用。

## 使用 Docker 直接部署

1. 构建 Docker 镜像：

```bash
docker build -t fastmcp-api .
```

2. 运行 Docker 容器：

```bash
docker run -d -p 3000:3000 --name fastmcp-api fastmcp-api
```

## 检查服务状态

查看容器日志：

```bash
# 使用 Docker Compose
docker-compose logs -f

# 直接使用 Docker
docker logs -f fastmcp-api
```

## 注意事项

1. FastMCP 服务会监听 `0.0.0.0:3000`，这意味着它在容器内可以接收来自任何 IP
   的连接。
2. 通过 Docker 的端口映射，您可以通过 `http://localhost:3000/sse`
   在宿主机访问服务。
3. 如果需要在生产环境中部署，建议：
   - 在前面加一个反向代理（如 Nginx）
   - 配置 HTTPS
   - 设置适当的访问控制
