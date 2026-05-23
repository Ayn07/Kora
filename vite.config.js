import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxies /api/* → backend on 5000 during development
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        // If backend doesn't respond, the app falls back gracefully
        // (AuthView handles the catch and uses a local mock user)
      },
    },
  },
});
