import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Tests (T05): reine Logik ohne Browser – Reducer, Erkennung, Datums-Regeln. `npm test`
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.test.ts", "api/**/*.test.ts", "convex/**/*.test.ts"], environment: "node" },
});
