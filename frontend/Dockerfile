FROM node:20-alpine AS build
WORKDIR /workspace
COPY . /workspace
WORKDIR /workspace/frontend
RUN npm ci
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /workspace/frontend/.next .next
COPY --from=build /workspace/frontend/package.json package.json
COPY --from=build /workspace/frontend/public ./public
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "./.next/standalone/server.js"]
