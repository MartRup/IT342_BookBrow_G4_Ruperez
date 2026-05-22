FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/build /usr/share/nginx/html

ENV PORT=80
ENV REACT_APP_API_URL=http://localhost:8080
ENV BACKEND_URL=http://localhost:8080
EXPOSE 80

CMD ["/bin/sh", "-c", "printf 'window.__BOOKBROW_ENV__ = { REACT_APP_API_URL: \"%s\" };\\n' \"$REACT_APP_API_URL\" > /usr/share/nginx/html/env.js && nginx -g 'daemon off;'"]
