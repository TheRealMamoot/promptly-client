FROM node:24.4.1-alpine3.21 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL_ARG
ENV VITE_API_URL=$VITE_API_URL_ARG
RUN npm run build

FROM nginx:1.29.0-alpine3.22 AS production-stage
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
