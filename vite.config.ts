import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js', // explicitly point to postcss config
  },
  build: {
    rollupOptions: {
      // ensure nothing critical like supabase gets excluded
      external: [],
    },
  },
  resolve: {
    alias: {
      '@': '/src', // optional: lets you import with @/ instead of relative paths
    },
  },
})
