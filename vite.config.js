import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss({
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
    })
  ],
  server: {
    host: '0.0.0.0',
    hmr: {
      clientPort: 443
    },
    allowedHosts: ['.replit.dev']
  }
})