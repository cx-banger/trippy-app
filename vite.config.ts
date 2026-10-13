import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app from /trippy-app/ (set by the deploy workflow)
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  server: { host: true },
})
