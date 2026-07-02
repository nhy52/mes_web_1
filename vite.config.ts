import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages는 https://<username>.github.io/<repo>/ 로 서빙되므로 저장소 이름을 base로 지정.
  // 저장소 이름이 다르면 아래 값을 '/<저장소이름>/' 로 바꾸세요.
  base: process.env.NODE_ENV === 'production' ? '/mes_web_1/' : '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
