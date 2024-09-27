FROM node:18.19.0 AS build

WORKDIR /app

COPY . .

ENV YARN_ENABLE_IMMUTABLE_INSTALLS=false

RUN mkdir -p .git
RUN yarn set version 3.2.1
RUN corepack enable
RUN yarn install
RUN yarn build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/build .
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
