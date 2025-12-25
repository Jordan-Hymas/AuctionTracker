# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build args for environment variables
ARG VITE_API_URL=/api/v1
ARG VITE_WS_URL=/ws

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (will be created later)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
