# ── Stage 1: Build React app ──────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Cache node_modules layer separately
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Copy nginx config template (supports ${PORT} and ${BACKEND_URL} substitution)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built React app
COPY --from=build /app/build .

# Runtime environment — these are overridden by Render's env vars at container start
# REACT_APP_API_URL is injected at runtime via env.js (not baked into the build)
ENV PORT=80
ENV REACT_APP_API_URL=""
ENV BACKEND_URL=""

EXPOSE 80

# At startup: write runtime env.js so the React app gets the correct API URL,
# then start nginx
CMD ["/bin/sh", "-c", \
  "printf 'window.__BOOKBROW_ENV__ = { REACT_APP_API_URL: \"%s\" };\\n' \"$REACT_APP_API_URL\" \
  > /usr/share/nginx/html/env.js && nginx -g 'daemon off;'"]
