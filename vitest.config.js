import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    // make sure Vite resolves vue files properly for vitest
    deps: {
      inline: ['vue']
    }
  },
})
