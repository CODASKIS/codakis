# CODAKIS Web — build Vite + Nginx (proxy /api → backend)
FROM node:22-alpine AS build

WORKDIR /workspace/frontend-web

COPY frontend-web/package.json frontend-web/package-lock.json frontend-web/.npmrc ./
RUN npm ci

COPY frontend-web/ ./

ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL= \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

FROM nginx:1.27-alpine

COPY frontend-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend-web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
