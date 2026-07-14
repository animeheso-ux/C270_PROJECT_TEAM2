import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/Login': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/GetToken': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/questions': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/check-answer': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})