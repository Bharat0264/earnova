FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY src ./src

# Non-root user for security
RUN addgroup -S earnova && adduser -S earnova -G earnova
USER earnova

EXPOSE 5000
CMD ["node", "src/server.js"]
