FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8787 \
    YANZHI_DATA_DIR=/app/data

WORKDIR /app

COPY package.json ./
COPY server ./server
COPY public ./public
COPY docs ./docs

RUN mkdir -p /app/data \
    && chown -R node:node /app

USER node
VOLUME ["/app/data"]
EXPOSE 8787

CMD ["node", "server/server.js"]
