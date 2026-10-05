import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

process.env.TZ = 'America/Sao_Paulo'; // antes dos workers do Vitest: datas iguais na sua máquina e na CI

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8080' } },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] },
});
