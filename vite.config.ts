import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dynamic API server detection
function getApiTarget() {
  // Check environment variable first
  const envApiUrl = process.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // Default to port 3002, but could be made more dynamic
  return process.env.API_PORT ? `http://127.0.0.1:${process.env.API_PORT}` : 'http://127.0.0.1:3002';
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: getApiTarget(),
        changeOrigin: true,
        secure: false
      }
    }
  }
})