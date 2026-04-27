import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  preview: {
    allowedHosts: ['2026-1-anatoquizup-web-production.up.railway.app'],
  },
})