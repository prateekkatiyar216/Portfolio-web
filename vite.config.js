import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import portfolio from './scripts/vite-plugin-portfolio.js'

export default defineConfig({
  plugins: [portfolio(), react(), tailwindcss()],
})
