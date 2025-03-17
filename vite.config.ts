import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Cho phép truy cập từ các host bên ngoài
    strictPort: false,
    allowedHosts: [
      "6ee2-2402-800-63b6-8bec-981e-192e-3aa6-cd7d.ngrok-free.app" // ✅ Thêm ngrok vào danh sách cho phép
    ],
    proxy: {
      "/api": {
        target: "https://6ee2-2402-800-63b6-8bec-981e-192e-3aa6-cd7d.ngrok-free.app",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
