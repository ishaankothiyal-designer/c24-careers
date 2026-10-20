import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [
    {
      name: 'reinitialize-recovered-page',
      handleHotUpdate(context) {
        // Recovered native DOM modules bind once. A full refresh is required
        // after editing fragments or their initialization, rather than swapping
        // their live DOM underneath already-bound event handlers.
        if (context.file.includes('/src/')) {
          context.server.ws.send({ type: 'full-reload' });
          return [];
        }
      },
    },
    react(),
  ],
});
