# Stage 1: build the frontend
FROM node:22-alpine AS builder
WORKDIR /app/myapp
COPY myapp/package*.json ./
RUN npm ci
COPY myapp/ .
RUN npm run build

# Stage 2: backend runtime
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
COPY --from=builder /app/myapp/dist ./myapp/dist
EXPOSE 8080
CMD ["node", "server.js"]