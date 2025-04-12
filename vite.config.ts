import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/pet_fe/', // Thêm dòng này, đảm bảo tên giống với tên repository
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Đảm bảo file index.html được sử dụng cho tất cả các routes
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
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
