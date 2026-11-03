import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import jobs from './api/jobs.js';
import jobDetail from './api/jobs/[id].js';
import applications from './api/applications.js';

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
      name: 'local-careers-api',
      configureServer(server) {
        Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), 'DARWINBOX_'));
        server.middlewares.use(async (req, res, next) => {
          const path = new URL(req.url, 'http://localhost').pathname;
          const handler = path === '/api/jobs' ? jobs : /^\/api\/jobs\/[a-zA-Z0-9_-]+$/.test(path) ? jobDetail : path === '/api/applications' ? applications : null;
          if (!handler) return next();
          await handler(req, res);
        });
      },
    },
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
