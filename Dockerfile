FROM public-cn-beijing.cr.volces.com/public/node:18-alpine
WORKDIR /opt/application
COPY package.json ./
COPY app.js ./

# 关键修复：创建平台需要的启动脚本
RUN echo "#!/bin/sh" > run.sh && \
    echo "node app.js" >> run.sh && \
    chmod +x run.sh

EXPOSE 8000
CMD ["sh", "/opt/application/run.sh"]