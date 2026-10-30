import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Không inject API key nào vào bundle: mọi lời gọi AI đi qua backend.
export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom', 'react-dom/client', 'react-router-dom'],
              motion: ['framer-motion'],
            },
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
