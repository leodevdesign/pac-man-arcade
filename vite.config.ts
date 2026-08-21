import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: process.env.ELECTRON_BUILD ? './' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        play: resolve(__dirname, 'play.html'),
      },
    },
  },
});
