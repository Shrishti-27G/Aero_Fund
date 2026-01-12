import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // allows access from LAN / all network interfaces
    port: 3000,       // run on port 3000
    strictPort: true, // ensures it doesn't switch ports automatically
  },
})