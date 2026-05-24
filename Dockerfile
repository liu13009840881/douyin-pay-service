# 使用国内可访问的 Node.js 镜像
FROM registry.aliyuncs.com/node_16_alpine/node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 并安装依赖
COPY package*.json ./
RUN npm install --production --registry=https://registry.npmmirror.com

# 复制所有代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]