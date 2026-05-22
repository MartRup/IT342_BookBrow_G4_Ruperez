import axios from 'axios';
import { Platform } from 'react-native';

/**
 * API Base URL Configuration
 *
 * Choose the right URL for your setup:
 *
 *  - Android Emulator  → http://10.0.2.2:8080/api/v1
 *  - iOS Simulator     → http://localhost:8080/api/v1
 *  - Physical Device   → http://<your-computer-LAN-IP>:8080/api/v1
 *
 * Your computer's current LAN IP: 192.168.1.3
 * Make sure your phone and computer are on the SAME WiFi network.
 */

// ─── Change this to switch between emulator and physical device ───────────────
// Set EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:8080 for a physical device.
// ─────────────────────────────────────────────────────────────────────────────

const normalizeApiBaseUrl = (url) => {
  if (!url) return null;
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

const getBaseURL = () => {
  const configuredUrl = normalizeApiBaseUrl(
    process.env.EXPO_PUBLIC_API_URL || process.env.REACT_APP_API_URL
  );
  if (configuredUrl) {
    return configuredUrl;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1';
  }
  return 'http://localhost:8080/api/v1';
};

const API_BASE_URL = getBaseURL();

console.log('[API] Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Handle global response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('[API] Unauthorized – token may have expired');
    }
    return Promise.reject(error);
  }
);

export default api;
