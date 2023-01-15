import * as path from "node:path";
import * as fs from "node:fs/promises";

import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";
import { minify } from "html-minifier-terser";

import { app } from "./docs/akte.app";

const MINIFY_HTML_OPTIONS = {
	collapseBooleanAttributes: true,
	collapseWhitespace: true,
	keepClosingSlash: true,
	minifyCSS: true,
	removeComments: true,
	removeRedundantAttributes: true,
	removeScriptTypeAttributes: true,
	removeStyleLinkTypeAttributes: true,
	useShortDoctype: true,
};

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				vite: "./src/vite/index.ts",
			},
		},
	},
	plugins: [
		sdk(),
		{
			name: "akte:welcome",
			async writeBundle(options) {
				const match = app.lookup("/welcome");
				const welcomePage = await app.render(match);

				// Load assets from documentation
				welcomePage.replace(
					"</head>",
					`<base href="https://akte.js.org" /></head>`,
				);

				const welcomePageMin = await minify(welcomePage, MINIFY_HTML_OPTIONS);

				await fs.writeFile(
					path.resolve(options.dir || "dist", "akteWelcome.html"),
					welcomePageMin,
					"utf-8",
				);
			},
		},
	],
	test: {
		coverage: {
			reporter: ["lcovonly", "text"],
		},
		setupFiles: ["./test/__setup__.ts"],
	},
});
