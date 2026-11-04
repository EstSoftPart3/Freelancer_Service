ARG APP

FROM node:22-alpine AS build
ARG APP
WORKDIR /app
COPY ${APP}/ .
ENV VUE_APP_API_URL=/api VITE_API_URL=/api
RUN npm ci && npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
