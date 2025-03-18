import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Move_Jess/',
  server: {
    proxy: {
      '/api': 'http://localhost:5001',  // ✅ Proxy API calls to backend
    },
  },
})
