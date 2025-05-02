import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Externalize react-pdf to avoid bundling issues
      external: ['react-pdf'],
      output: {
        // Global variables to use in the UMD build for externalized deps
        globals: {
          'react-pdf': 'ReactPDF',
        },
        manualChunks: {
          // Create a separate chunk for PDF.js
          pdfjs: ['react-pdf'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1600,
  },
  optimizeDeps: {
    // Include react-pdf in the dependency optimization
    include: ['react-pdf'],
    // Force Vite to bundle these dependencies during optimization
    force: true,
  },
  resolve: {
    alias: {
      // Add an alias for react-pdf to help with resolution
      'react-pdf': resolve(__dirname, 'node_modules/react-pdf'),
    },
  },
})
