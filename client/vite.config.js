import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// "npm run dev" (port 5173) sends /api to the server on port 4000.
// "npm start" from the project root serves the built screens on port 4000.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: { "/api": "http://localhost:4000" }
    }
});
