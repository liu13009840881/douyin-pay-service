FROM cr.volces.com/volc-public/node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production --registry=https://registry.npmmirror.com
COPY . .
EXPOSE 3000
CMD ["npm", "start"]