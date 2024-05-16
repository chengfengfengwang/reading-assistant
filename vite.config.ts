import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifestConfig from "./manifest.config";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest: manifestConfig })],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 7788,
  },
  build: {
    rollupOptions: {
      input: {
        sidePanel: "src/pages/sidePanel/index.html",
      },
    },
  },
});
