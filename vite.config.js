import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Set base to "/<repo-name>/" if deploying to GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: "/Result_Update/", // must match your GitHub repo name exactly (case-sensitive)
});