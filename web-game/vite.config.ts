import { defineConfig } from 'vite';

export default defineConfig({
  // Netlify site root. Subpath deploy uchun: base: '/repo-name/'
  base: '/',
  server: {
    host: true,
    port: 5173,
    open: true,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 2000,
    sourcemap: false,
  },
});
