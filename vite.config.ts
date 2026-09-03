import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageMetadata from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'release-version-meta',
      transformIndexHtml: {
        order: 'pre',
        handler() {
          return [{
            tag: 'meta',
            attrs: {
              name: 'lifetrkr-version',
              content: packageMetadata.version,
            },
            injectTo: 'head',
          }]
        },
      },
    },
  ],
  base: process.env.NODE_ENV === 'production' ? '/kierans-lifetrkr/' : '/',
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
})
