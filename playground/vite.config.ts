import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^@zyyv\/vanish$/,
        replacement: fileURLToPath(new URL('../packages/vanish/src/index.ts', import.meta.url)),
      },
    ],
    dedupe: ['vue'],
  },
  server: {
    port: 5173,
  },
})
