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
    react({
      // Enable JSX fast refresh (HMR) - this is correct
      // fastRefresh is a valid option in @vitejs/plugin-react
      // If you're getting an error, your version might be different
      // Remove this line if the error persists
      // fastRefresh: true,
      
      // Alternative: Use babel plugins configuration
      babel: {
        plugins: [
          ['@babel/plugin-transform-runtime', {
            regenerator: true,
          }],
        ],
      },
      // Exclude node_modules from HMR
      exclude: /node_modules/,
      // Include all source files for HMR
      include: /\.(jsx|tsx)$/,
    }),
    tailwindcss(),
  ],
  
  resolve: {
    alias: {
      // Correctly maps '@' to the 'src' folder
      '@': path.resolve(__dirname, './src'),
      // Additional aliases for cleaner imports
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@data': path.resolve(__dirname, './src/data'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  
  // Asset handling
  assetsInclude: ['**/*.svg', '**/*.csv', '**/*.json'],
  
  // Build configuration for production
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production (reduces size)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: false, // Remove comments
      },
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: {
          // React core and routing
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          
          // UI frameworks
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          
          // Radix UI components (split into common and specific)
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
          
          // Charting libraries
          'charts': ['recharts'],
          
          // Form handling and utilities
          'form-utils': ['react-hook-form', 'date-fns', 'clsx', 'tailwind-merge'],
          
          // PDF generation
          'pdf': ['jspdf'],
          
          // Animation and effects
          'animations': ['motion', 'canvas-confetti'],
          
          // Carousel and layout
          'carousel': ['embla-carousel-react', 'react-slick', 'react-responsive-masonry', 'react-resizable-panels'],
          
          // Drag and drop
          'dnd': ['react-dnd', 'react-dnd-html5-backend'],
          
          // Command palette and OTP
          'commands': ['cmdk', 'input-otp', 'sonner', 'vaul'],
          
          // Themes and utilities
          'themes': ['next-themes', 'class-variance-authority', 'tw-animate-css'],
        },
        
        // Optimize chunk size
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        
        // Compact output for better performance
        compact: true,
        
        // Preserve module structure for tree shaking
        preserveModules: false,
      },
    },
    
    // Increase chunk size warning limit (since we have large UI libraries)
    chunkSizeWarningLimit: 1000,
    
    // Target modern browsers
    target: 'es2020',
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Generate manifest for better caching
    manifest: true,
    
    // Enable brotli compression (Vercel will handle this)
    reportCompressedSize: true,
  },
  
  // Server configuration for development
  server: {
    port: 3000,
    open: true,
    host: true, // Listen on all addresses (useful for network testing)
    watch: {
      usePolling: true, // For environments with file system issues
    },
    // Proxy configuration if needed (optional)
    proxy: {
      // Example: if you need to proxy API calls
      // '/api': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true,
      // },
    },
  },
  
  // Preview configuration for production build testing
  preview: {
    port: 4173,
    open: true,
    host: true,
  },
  
  // Optimize dependencies to improve build time
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
    exclude: [
      '@tailwindcss/vite', // Exclude from pre-bundling
    ],
  },
  
  // Define environment variables for the app
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // CSS options
  css: {
    devSourcemap: true, // Enable CSS source maps in development
    modules: {
      localsConvention: 'camelCase', // Convert class names to camelCase
    },
  },
  
  // ESBuild options for faster builds
  esbuild: {
    // Drop console logs in production (esbuild level)
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Keep comments for development
    legalComments: process.env.NODE_ENV === 'production' ? 'none' : 'inline',
  },
})