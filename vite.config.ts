import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Se estiver gerando build do Electron (file://), usa relativo './'. Na Vercel/Web, usa '/'
  base: process.env.ELECTRON_BUILD ? './' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        site: resolve(__dirname, 'site/index.html'),
      },
    },
  },
});
