# ── BookBrow Mobile – Expo Development Server ────────────────────────────────
#
# PURPOSE: This Dockerfile runs the Expo development server inside a container.
# It does NOT build a production APK/IPA — that must be done via:
#   - EAS Build (recommended):  npx eas build
#   - Local Android build:       npm run android  (requires Android SDK)
#   - Local iOS build:           npm run ios      (requires macOS + Xcode)
#
# USAGE:
#   docker build -t bookbrow-mobile .
#   docker run -it --rm \
#     -p 8081:8081 \
#     -p 19000:19000 \
#     -p 19001:19001 \
#     -e API_BASE_URL=http://<your-local-ip>:8080/api/v1 \
#     -e EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
#     bookbrow-mobile
#
# Then scan the QR code with Expo Go on your physical device.
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine
WORKDIR /app

# Install Expo CLI globally
RUN npm install -g expo-cli@latest --silent

# Cache dependencies layer
COPY package*.json ./
RUN npm install --silent

# Copy source
COPY . .

# Expo ports:
#   8081  – Metro bundler (JS bundle)
#   19000 – Expo dev server
#   19001 – Expo dev server (legacy)
EXPOSE 8081 19000 19001

# Runtime env — override with -e API_BASE_URL=http://<backend-host>:8080/api/v1
ENV API_BASE_URL=http://localhost:8080/api/v1
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

CMD ["npx", "expo", "start", "--tunnel", "--non-interactive"]
