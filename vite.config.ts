import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for GitHub Pages — served from
//   https://<user>.github.io/cds-nav/
// Override at build time with VITE_BASE for custom domains or other hosts.
const base = process.env.VITE_BASE ?? '/cds-nav/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 6011,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
