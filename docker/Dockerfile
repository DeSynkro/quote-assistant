FROM node:24-alpine

WORKDIR /app

COPY app ./app
COPY docker/server.js ./server.js

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    APP_DIR=/app/app \
    DATA_DIR=/data

RUN mkdir -p /data/jobs /data/trash && chown -R node:node /data

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/api/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
