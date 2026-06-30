import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const FRONTEND_DEV_PORT = 5173;

export default defineConfig({
  plugins: [react()],
  server: {
    port: FRONTEND_DEV_PORT,
    strictPort: true,
  },
});
