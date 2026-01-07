import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3025,
    proxy: {
      '/api': {
        target: 'http://localhost:3026',
        changeOrigin: true,
      },
    },
  },
})


