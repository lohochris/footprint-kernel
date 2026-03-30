import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// In ESM (Modern Node), __dirname isn't globally defined. 
// This logic ensures compatibility across all environments.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Correctly maps '@' to the 'src' folder
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Ensure we don't treat standard assets as external raw strings
  assetsInclude: ['**/*.svg', '**/*.csv'],
  
  // Optimization for HMR (Hot Module Replacement)
  server: {
    watch: {
      usePolling: true,
    },
  },
})