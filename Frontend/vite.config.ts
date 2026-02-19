import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // Base path for deployment - must be '/' when using BrowserRouter
  // so that asset paths are absolute and work on all routes (/charts, /settings, etc.)
  base: '/',
  
  server: {
    port: 3000,
    open: true
  },
  
  build: {
    // Minimum browser targets - aligns with what Autoprefixer and Vite transpile for
    target: ['es2020', 'chrome87', 'firefox78', 'safari14', 'edge88'],

    // Output directory for static files
    outDir: 'dist',
    
    // Assets directory
    assetsDir: 'assets',
    
    // Enable source maps for debugging
    sourcemap: true,
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Rollup options for better chunking
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          icons: ['lucide-react']
        },
        
        // Ensure consistent asset naming with content hashes
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Empty outDir before build
    emptyOutDir: true
  }
})

