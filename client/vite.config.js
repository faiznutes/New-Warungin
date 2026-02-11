import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Warungin - Sistem Kasir Modern untuk UMKM',
        short_name: 'Warungin',
        description: 'Sistem kasir modern untuk mengelola warung dan toko Anda',
        theme_color: '#2563EB',
        background_color: '#2563EB',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ],
        shortcuts: [
          {
            name: 'POS',
            short_name: 'POS',
            description: 'Buka halaman kasir',
            url: '/app/pos'
          },
          {
            name: 'Produk',
            short_name: 'Produk',
            description: 'Kelola produk',
            url: '/app/products'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/products/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-products-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  // Performance optimizations
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Enable detailed error overlay in development
    hmr: {
      overlay: true, // Show error overlay on screen
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Don't rewrite, keep /api
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('❌ Proxy Error:', err);
            console.error('Error details:', {
              message: err.message,
              code: err.code,
              stack: err.stack,
            });
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('📤 Sending Request:', req.method, req.url);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            if (process.env.NODE_ENV === 'development') {
              const statusColor = proxyRes.statusCode >= 400 ? '🔴' : proxyRes.statusCode >= 300 ? '🟡' : '🟢';
              console.log(`${statusColor} Response:`, proxyRes.statusCode, req.url);
              if (proxyRes.statusCode >= 400) {
                console.error('Error Response Details:', {
                  status: proxyRes.statusCode,
                  url: req.url,
                  headers: proxyRes.headers,
                });
              }
            }
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development', // Enable sourcemap in development for debugging
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // Keep console.log in development
        drop_debugger: process.env.NODE_ENV === 'production',
      },
    },
    // Code splitting optimization
    rollupOptions: {
      output: {
        // Add hash to chunk filenames for better cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-vendor';
            }
            if (id.includes('@headlessui') || id.includes('@heroicons')) {
              return 'ui-vendor';
            }
            if (id.includes('chart.js') || id.includes('vue-chartjs')) {
              return 'chart-vendor';
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
          // Component chunks - ensure all views are included
          if (id.includes('/views/')) {
            const match = id.match(/\/views\/([^/]+)/);
            if (match) {
              const viewName = match[1];
              // Keep component names for better debugging
              return viewName;
            }
          }
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
});

