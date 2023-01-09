import { defineConfig } from "vite";
import akte from "akte/vite";

import { app } from "./akte.app";

export default defineConfig({
	root: "src",
	build: {
		outDir: "../dist",
		emptyOutDir: true,
	},
	plugins: [akte({ app })],
});