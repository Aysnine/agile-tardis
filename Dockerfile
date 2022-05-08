FROM node:14 AS build
WORKDIR /app
COPY package* yarn.lock tsconfig.json ./
RUN yarn install
COPY public ./public
COPY src ./src
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
