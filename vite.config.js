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
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['recharts'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    commonjsOptions: {
      include: [/recharts/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'recharts': ['recharts'],
        },
      },
      onwarn(warning, warn) {
        // Suppress "useAuth" export warnings
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        if (warning.message && warning.message.includes('useAuth')) return
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        // Suppress recharts warnings during build
        if (warning.message && warning.message.includes('recharts')) return
        warn(warning)
      },
    },
  },
})

