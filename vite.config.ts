import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Caminhos relativos para compatibilidade com Electron (file://) e deploys estáticos
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        site: resolve(__dirname, 'site/index.html'),
      },
    },
  },
});
