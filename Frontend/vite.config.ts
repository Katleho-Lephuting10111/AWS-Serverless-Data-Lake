import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // Base path for deployment
  // Use '/' for root of domain
  // Use './' for subdirectory deployments
  base: './',
  
  server: {
    port: 3000,
    open: true
  },
  
  build: {
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

