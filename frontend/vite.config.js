import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1600,
      },
    },
  },
  optimizeDeps: {
    // Include react-pdf in the dependency optimization
    include: ['react-pdf', 'pdfjs-dist'],
    // Exclude problematic dependencies
    exclude: [],
  },
  // Increase memory limit for build process
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
})
