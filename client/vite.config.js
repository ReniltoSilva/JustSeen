import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  /* "" loads every variable in .env, not only VITE_ ones; TMDB_TOKEN stays here on the server */
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        /* Same path the Netlify function answers in production: /api/tmdb/search/movie?query=... */
        "/api/tmdb": {
          target: "https://api.themoviedb.org/3",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tmdb/, ""),
          headers: { Authorization: `Bearer ${env.TMDB_TOKEN}` },
        },
      },
    },
  };
});
