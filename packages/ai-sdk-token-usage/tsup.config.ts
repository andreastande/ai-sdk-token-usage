import { defineConfig } from "tsup"

export default defineConfig({
	entry: { "index.core": "src/index.core.ts", "index.react": "src/index.react.ts" },
	format: ["cjs", "esm"],
	dts: true,
	sourcemap: true,
	clean: true,
	splitting: false,
	treeshake: true,
	outDir: "dist",
	minify: false,
	external: ["ai", "react"],
})
