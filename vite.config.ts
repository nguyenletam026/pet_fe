import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Cho phép truy cập từ các host bên ngoài
    strictPort: false,
    allowedHosts: [
      "540c-2a09-bac1-7ac0-10-00-279-8f.ngrok-free.app" // ✅ Thêm ngrok vào danh sách cho phép
    ],
    proxy: {
      "/api": {
        target: "https://540c-2a09-bac1-7ac0-10-00-279-8f.ngrok-free.app",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
