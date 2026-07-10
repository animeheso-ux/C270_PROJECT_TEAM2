FROM node:22-alpine

WORKDIR /app

# Copy frontend source
COPY . .

RUN npm ci

EXPOSE 5173

# Vite must listen on 0.0.0.0 inside a container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]