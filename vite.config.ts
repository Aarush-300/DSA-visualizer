import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/zustand') ||
            id.includes('node_modules\\react') ||
            id.includes('node_modules\\react-dom') ||
            id.includes('node_modules\\zustand')
          ) {
            return 'vendor-react';
          }
          if (id.includes('framer-motion') || id.includes('lucide-react')) {
            return 'vendor-motion';
          }
          if (
            id.includes('codeSnippets') ||
            id.includes('algorithmCatalog')
          ) {
            return 'dsa-code-catalog';
          }
        },
      },
    },
  },
});

