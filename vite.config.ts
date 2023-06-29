import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import pluginRewriteAll from "vite-plugin-rewrite-all";
import { imagetools } from "vite-imagetools";

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
    pluginRewriteAll(),
  ],
});
