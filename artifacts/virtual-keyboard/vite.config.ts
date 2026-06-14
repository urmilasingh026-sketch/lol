import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT;
const port = rawPort && !Number.isNaN(Number(rawPort)) ? Number(rawPort) : 5173;
const basePath = process.env.BASE_PATH ?? "/";

const isReplit = Boolean(process.env.REPL_ID);
const isDev = process.env.NODE_ENV !== "production";

async function loadOptionalPlugin(pkg: string, factory: (mod: any) => any) {
  try {
    const mod = await import(pkg);
    return factory(mod);
  } catch {
    return null;
  }
}

export default defineConfig(async () => {
  const replitPlugins: any[] = [];

  if (isDev && isReplit) {
    const errorModal = await loadOptionalPlugin(
      "@replit/vite-plugin-runtime-error-modal",
      (m) => m.default?.() ?? m.runtimeErrorModal?.(),
    );
    const cartographer = await loadOptionalPlugin(
      "@replit/vite-plugin-cartographer",
      (m) => m.cartographer?.({ root: path.resolve(import.meta.dirname, "..") }),
    );
    const devBanner = await loadOptionalPlugin(
      "@replit/vite-plugin-dev-banner",
      (m) => m.devBanner?.(),
    );
    if (errorModal) replitPlugins.push(errorModal);
    if (cartographer) replitPlugins.push(cartographer);
    if (devBanner) replitPlugins.push(devBanner);
  }

  return {
    base: basePath,
    plugins: [react(), tailwindcss(), ...replitPlugins],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(
          import.meta.dirname,
          "..",
          "..",
          "attached_assets",
        ),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "zustand",
        "framer-motion",
        "lucide-react",
      ],
      esbuildOptions: { target: "es2017" },
    },
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      target: ["es2017", "safari13"],
      minify: "esbuild",
      cssMinify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom")
            )
              return "vendor-react";
            if (id.includes("node_modules/framer-motion"))
              return "vendor-framer";
            if (id.includes("node_modules/zustand")) return "vendor-zustand";
            if (id.includes("node_modules/lucide-react"))
              return "vendor-lucide";
          },
        },
      },
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: {
        "/api": {
          target: `http://localhost:${process.env.API_PORT ?? 8080}`,
          changeOrigin: true,
        },
      },
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
