import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path"; // Import the 'path' module

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // Change environment to jsdom for React Testing Library
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    // Add alias resolution mirroring tsconfig.json
    alias: {
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@modules": path.resolve(__dirname, "./src/modules"),
    },
  },
});
