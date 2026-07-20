import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://33qrojuqfde2na3a6gvel5k53m0muxal.lambda-url.ap-south-1.on.aws",
        changeOrigin: true,
      },
    },
  },
});