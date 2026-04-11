# Stage 1: Build the React application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci 

# Copy the source code
COPY frontend/ .

# Bake in the API URL during build time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
