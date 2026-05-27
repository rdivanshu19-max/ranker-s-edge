import { defineConfig as defineLovableConfig } from "@lovable.dev/vite-tanstack-config";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig as defineViteConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
const tanstackStartConfig = {
  tanstackStart: {
    server: { entry: "server" },
  },
};

const isVercel = process.env.VERCEL === "1";

export default isVercel
  ? defineViteConfig({
      plugins: [
        tailwindcss(),
        tsConfigPaths({ projects: ["./tsconfig.json"] }),
        tanstackStart(tanstackStartConfig.tanstackStart),
        nitro({ preset: "vercel" }),
        viteReact(),
      ],
    })
  : defineLovableConfig(tanstackStartConfig);
