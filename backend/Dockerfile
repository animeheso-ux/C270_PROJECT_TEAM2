FROM node:22-alpine

WORKDIR /app

# Copy backend source code
COPY . .

# Install dependencies
RUN npm ci && npm install cors

EXPOSE 3000

# Start the backend
CMD ["node", "server.js"]