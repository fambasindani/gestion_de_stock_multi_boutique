import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL || "http://localhost:8005/api";

  return {
    // L'application est servie sous /gst (ex: http://localhost:5173/gst/dashboard/pos)
    base: "/gst/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "next/navigation": fileURLToPath(
          new URL("./src/shims/next-navigation.ts", import.meta.url)
        ),
        "next/link": fileURLToPath(
          new URL("./src/shims/next-link.tsx", import.meta.url)
        ),
      },
    },
    define: {
      "process.env.NEXT_PUBLIC_API_URL": JSON.stringify(apiUrl),
      "process.env.NEXT_PUBLIC_BASE_PATH": JSON.stringify("/gst"),
    },
    server: {
      port: 5173,
      host: true,
    },
  };
});
