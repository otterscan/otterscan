import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRouter(),
    viteCompression(),
    viteCompression({ algorithm: "brotliCompress" }),
    imagetools(),
    tailwindcss(),
  ],
  optimizeDeps: {
    entries: ["./src/**/*.{js,jsx,ts,tsx}"],
  },
});
