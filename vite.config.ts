import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "global": {},
  },
  plugins: [
    react(),
    viteCompression(),
    viteCompression({ algorithm: "brotliCompress" }),
    imagetools(),
  ],
});
