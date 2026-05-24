FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com && \
    npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]