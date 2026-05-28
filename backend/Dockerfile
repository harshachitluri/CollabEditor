FROM node:20-alpine

WORKDIR /app

# copy project root so local file:../frontend references resolve during build
COPY . /app

WORKDIR /app/backend
RUN npm ci --only=production --ignore-scripts || true
RUN npm run build

EXPOSE 3001
CMD ["node", "dist/app.js"]
