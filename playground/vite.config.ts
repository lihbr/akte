import { defineConfig } from "vite";
import akte from "akte/vite";

import { app } from "./akte.app";

export default defineConfig({
	root: "src",
	build: {
		outDir: "../dist",
		emptyOutDir: true,
	},
	// TypeScript appears to be drunk here with npm workspaces
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	plugins: [akte({ app: app as any })],
});
