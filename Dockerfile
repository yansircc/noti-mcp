FROM oven/bun:1.0 as base

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 bun.lock
COPY package.json bun.lock ./

# 安装依赖
RUN bun install --frozen-lockfile

# 复制源代码
COPY . .

# 暴露 FastMCP SSE 服务端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动命令
CMD ["bun", "run", "src/main.ts"] 