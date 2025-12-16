import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React y ReactDOM en su propio chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separar Supabase en su propio chunk
          'supabase-vendor': ['@supabase/supabase-js'],
          // Separar iconos en su propio chunk
          'icons-vendor': ['lucide-react'],
        },
      },
    },
    // Optimizar tamaño del chunk
    chunkSizeWarningLimit: 1000,
    // Minificar con esbuild (más rápido que terser y ya incluido)
    minify: 'esbuild',
    // Configuración de esbuild
    target: 'es2015',
  },
  // Optimizar el dev server
  server: {
    hmr: {
      overlay: false, // Menos overhead
    },
  },
})
