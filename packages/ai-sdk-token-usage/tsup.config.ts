import { defineConfig } from "tsup"

export default defineConfig([
  // Core APIs
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    minify: false,
    external: ["ai", "react"],
  },
  // Metadata APIs
  {
    entry: ["src/metadata/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    outDir: "dist/metadata",
    minify: false,
    external: ["ai"],
  },
])
