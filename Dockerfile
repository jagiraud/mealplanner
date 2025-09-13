# Development Environment
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./
COPY packages/*/package*.json ./packages/*/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build shared package
RUN npm run build --workspace=packages/shared

# Expose ports
EXPOSE 3000 7071

# Default command
CMD ["npm", "run", "dev"]
