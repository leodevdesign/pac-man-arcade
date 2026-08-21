import { defineConfig } from 'vite';

export default defineConfig({
  // Caminhos relativos para compatibilidade com Electron (file://) e deploys estáticos
  base: './',
});
