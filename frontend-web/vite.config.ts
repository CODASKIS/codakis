import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const dashboardkitRoot = path.resolve(__dirname, "./src/dashboardkit");

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
        components: path.resolve(dashboardkitRoot, "components"),
        layouts: path.resolve(dashboardkitRoot, "layouts"),
        contexts: path.resolve(dashboardkitRoot, "contexts"),
        hooks: path.resolve(dashboardkitRoot, "hooks"),
        store: path.resolve(dashboardkitRoot, "store"),
        config: path.resolve(dashboardkitRoot, "config"),
        data: path.resolve(dashboardkitRoot, "data"),
        utils: path.resolve(dashboardkitRoot, "utils"),
        assets: path.resolve(dashboardkitRoot, "assets"),
        views: path.resolve(dashboardkitRoot, "views"),
        "menu-items": path.resolve(dashboardkitRoot, "menu-items.js"),
        "menu-items-collapse": path.resolve(dashboardkitRoot, "menu-items-collapse.js"),
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
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          loadPaths: [path.resolve(__dirname, "node_modules")],
        },
      },
    },
  };
});
