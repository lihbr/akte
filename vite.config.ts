import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				vite: "./src/vite/index.ts",
			},
		},
	},
	plugins: [sdk()],
	test: {
		coverage: {
			reporter: ["lcovonly", "text"],
		},
	},
});
