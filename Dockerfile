FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITEPRESS_SITE_URL=http://workhub.intra
ARG VITEPRESS_PUBLIC_MODE=false
ENV VITEPRESS_SITE_URL=$VITEPRESS_SITE_URL
ENV VITEPRESS_PUBLIC_MODE=$VITEPRESS_PUBLIC_MODE
RUN npm run docs:build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
