/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/4phasteprompt-eventra/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  define: {
    // The Gemini SDK uses process.env.API_KEY. Vite requires environment variables
    // to be prefixed with VITE_ to expose them to the client. This define statement
    // maps the expected variable to the Vite-specific one.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    css: true,
  },
})
