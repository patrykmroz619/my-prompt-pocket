import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node', // Use 'node' since we skipped jsdom
    globals: true, // Optional: makes Vitest APIs globally available
    setupFiles: ['./src/tests/setup.ts'], // Add path to setup file
  },
});
