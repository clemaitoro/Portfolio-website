import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project page is served from https://clemaitoro.github.io/Portfolio-website/
// so assets must resolve under that subpath in production.
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/Portfolio-website/" : "/",
  plugins: [react()],
});
