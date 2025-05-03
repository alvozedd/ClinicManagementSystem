import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-3d',
  },
  server: {
    port: 3001,
  },
  define: {
    'process.env.USE_3D': JSON.stringify('true'),
  },
})
