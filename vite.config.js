import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress "useAuth" export warnings
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        if (warning.message && warning.message.includes('useAuth')) return
        warn(warning)
      },
    },
  },
})

