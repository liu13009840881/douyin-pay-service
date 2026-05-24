FROM public-cn-beijing.cr.volces.com/public/node:18-alpine
WORKDIR /app
COPY package.json ./
COPY app.js ./
CMD ["node", "app.js"]