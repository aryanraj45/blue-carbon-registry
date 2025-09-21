import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Your existing host and port settings are fine for Render.
    host: "::",
    port: 8080,

    // Added this to fix the "Blocked request" error.
    allowedHosts: [
      'earth-credits-hub-32.onrender.com'
    ],
    
    // This is crucial for Hot Module Replacement (HMR) to work correctly
    // behind Render's HTTPS proxy.
    hmr: {
      clientPort: 443
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  define: {
    // Fix for Buffer is not defined error
    "process.env": {},
    global: {},
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
    },
  },
  build: {
    rollupOptions: {
      // Add necessary polyfills for Solana Web3.js
      external: ["utf-8-validate", "bufferutil"],
    },
  },
}));