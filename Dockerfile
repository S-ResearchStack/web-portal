FROM node:16-alpine AS build

WORKDIR /app

COPY . .

ARG API_URL
ARG MOCK_API
ARG PUBLIC_PATH

ENV API_URL=$API_URL
ENV MOCK_API=$MOCK_API
ENV PUBLIC_PATH=$PUBLIC_PATH

RUN corepack enable && yarn install && yarn build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/build .
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
