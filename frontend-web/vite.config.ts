import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const repoRoot = path.resolve(__dirname, "..");
  const env = loadEnv(mode, repoRoot, "");
  const apiPort = env.API_PORT || "8000";

  return {
    envDir: repoRoot,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      proxy: {
        "/api": {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("error", (_err, _req, res) => {
              if (res && !res.headersSent && "writeHead" in res) {
                res.writeHead(503, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ detail: "API indisponible" }));
              }
            });
          },
        },
      },
    },
    preview: {
      port: 4173,
      strictPort: true,
      host: true,
      proxy: {
        "/api": {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 600,
    },
  };
});
