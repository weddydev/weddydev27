import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/*
  `npm run build` runs two passes (see package.json) so each page is emitted as ONE
  self-contained HTML file (JS + CSS inlined). That means dist/index.html opens with a
  double-click (file://) and deploys to Netlify / Vercel as-is.
*/
export default defineConfig(({ mode }) => {
  const page = mode === 'generator' ? 'generator.html' : 'index.html';
  return {
    base: './',
    plugins: [react(), tailwindcss(), viteSingleFile({ removeViteModuleLoader: true })],
    build: {
      emptyOutDir: mode !== 'generator',
      rollupOptions: { input: page },
      chunkSizeWarningLimit: 2000
    }
  };
});
