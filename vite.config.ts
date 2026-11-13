import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200, // Replace 3000 with your desired port
    // strictPort: true, // Optional: exit instead of trying the next port if 3000 is busy
  },
})
