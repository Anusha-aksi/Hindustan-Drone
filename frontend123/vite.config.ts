import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
            'vendor-query':   ['@tanstack/react-query'],
            'vendor-ui':      ['lucide-react', 'recharts'],
            'vendor-tiptap':  [
              '@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-image',
              '@tiptap/extension-link', '@tiptap/extension-text-align',
              '@tiptap/extension-underline', '@tiptap/extension-placeholder',
              '@tiptap/extension-text-style',
            ],
          },
        },
      },
    },
    server: {
      port: 5173,
      allowedHosts: ['.trycloudflare.com'],
      proxy: {
        '/api': {
          target: 'http://localhost:3006',
          changeOrigin: true,
        },

        '/uploads': {
          
          target: 'http://localhost:3006',
          changeOrigin: true,
        },
      },
    },
  };
});
