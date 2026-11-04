import { defineConfig } from "vitest/config";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
