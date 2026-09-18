import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      vue(),
      ...(command === 'serve' ? [{
        name: 'express-backend-integration',
        async configureServer(server) {
          const { default: app } = await import('./server/index.js')
          server.middlewares.use(app)
        }
      }] : [])
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      host: true
    }
  }
})
