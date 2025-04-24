import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import viteCompression from "vite-plugin-compression";
import { reactRouter } from "@react-router/dev/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRouter(),
    viteCompression(),
    viteCompression({ algorithm: "brotliCompress" }),
    imagetools(),
    tailwindcss(),
  ],
});
