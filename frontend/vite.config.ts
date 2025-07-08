import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize build performance
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          // Redux/state management
          if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/redux')) {
            return 'redux';
          }
          // UI components
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
          // Charts
          if (id.includes('node_modules/lightweight-charts') || id.includes('node_modules/recharts')) {
            return 'charts';
          }
          // Utilities
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
            return 'utils';
          }
          // Other vendor libraries
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
      },
    },
    // Optimize chunk sizes
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (can be disabled for smaller builds)
    sourcemap: false,
  },
  server: {
    // Development server port set to 3000 to standardize local development and avoid conflicts with other services.
        port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});