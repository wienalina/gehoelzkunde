import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' + HashRouter: läuft ohne Anpassung auf GitHub Pages,
// egal ob unter benutzername.github.io oder unter /repo-name/
export default defineConfig({
  plugins: [react()],
  base: './',
})
