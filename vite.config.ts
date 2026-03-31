import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-runtime', {
            regenerator: true,
          }],
        ],
      },
    }),
    tailwindcss(),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@data': path.resolve(__dirname, './src/data'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  
  assetsInclude: ['**/*.svg', '**/*.csv', '**/*.json'],
  
  build: {
    outDir: 'dist',
    sourcemap: false, 
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, 
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: false, 
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'radix-core': [
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-separator',
          ],
          'radix-interactive': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
          ],
          'charts': ['recharts'],
          'form-utils': ['react-hook-form', 'date-fns', 'clsx', 'tailwind-merge'],
          'pdf': ['jspdf'],
          'animations': ['motion', 'canvas-confetti'],
          'carousel': ['embla-carousel-react', 'react-slick', 'react-responsive-masonry', 'react-resizable-panels'],
          'dnd': ['react-dnd', 'react-dnd-html5-backend'],
          'commands': ['cmdk', 'input-otp', 'sonner', 'vaul'],
          /* FIXED: Removed 'tw-animate-css' from the themes chunk below */
          'themes': ['next-themes', 'class-variance-authority'],
        },
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        compact: true,
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2020',
    cssCodeSplit: true,
    manifest: true,
    reportCompressedSize: true,
  },
  
  server: {
    port: 3000,
    open: true,
    host: true,
    watch: {
      usePolling: true, 
    },
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'recharts',
      'date-fns',
      'clsx',
      'tailwind-merge',
    ],
    exclude: ['@tailwindcss/vite'],
  },
  
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  css: {
    devSourcemap: true,
  },

  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: process.env.NODE_ENV === 'production' ? 'none' : 'inline',
  },
})