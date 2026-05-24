# 抖音云推荐的国内可访问 Node.js 镜像（来自火山引擎官方镜像仓库）
FROM openyurt/node:16-alpine

# 设置工作目录
WORKDIR /app

# 先复制依赖文件，利用构建缓存加速
COPY package*.json ./

# 配置国内 npm 源，避免依赖下载超时
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --production

# 复制所有代码
COPY . .

# 抖音云强制要求的端口声明
EXPOSE 3000

# 启动命令（和 package.json 里的 scripts.start 保持一致）
CMD ["npm", "start"]