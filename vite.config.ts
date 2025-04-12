import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Cho phép truy cập từ các host bên ngoài
    strictPort: false,
    allowedHosts: [
      "pet-bdskewgt0-tams-projects-a4dbd6d6.vercel.app" // ✅ Thêm ngrok vào danh sách cho phép
    ],
    proxy: {
      "/api": {
        target: "https://pet-bdskewgt0-tams-projects-a4dbd6d6.vercel.app",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
