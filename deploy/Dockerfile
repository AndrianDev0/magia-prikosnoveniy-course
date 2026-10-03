FROM node:22-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4189 SITE_ROOT=/app
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
WORKDIR /app
COPY --chown=node:node server ./server
COPY --chown=node:node pages ./pages
COPY --chown=node:node public/course ./public/course
RUN rm -r /app/server/test
USER node
EXPOSE 4189
CMD ["node", "server/index.mjs"]
