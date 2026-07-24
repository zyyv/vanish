import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const packageRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(packageRoot, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['html2canvas', 'vue'],
    },
  },
})
