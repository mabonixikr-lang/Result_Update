import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Result_Update/", // must match the GitHub repo name exactly, including capitals
});