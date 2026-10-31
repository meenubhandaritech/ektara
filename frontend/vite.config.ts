import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const apiProxy = {
  '/api': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: apiProxy },
  preview: { port: 4173, proxy: apiProxy },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/gsap/')) return 'animation';
          if (id.includes('/node_modules/firebase/')) return 'firebase';
        },
      },
    },
  },
});
