import { defineConfig } from "vite";
import akte from "akte/vite";

import { app } from "./akte.app";

export default defineConfig({
	build: {
		cssCodeSplit: false,
		emptyOutDir: true,
		rollupOptions: {
			output: {
				entryFileNames: "assets/js/[name].js",
				chunkFileNames: "assets/js/[name].js",
				assetFileNames: (assetInfo) => {
					const extension = assetInfo.name?.split(".").pop();

					switch (extension) {
						case "css":
							return "assets/css/[name][extname]";

						case "woff":
						case "woff2":
							return "assets/fonts/[name][extname]";

						default:
							return "assets/[name][extname]";
					}
				},
			},
		},
	},
	plugins: [
		akte({ app }),
		{
			name: "markdown:watch",
			configureServer(server) {
				// Hot reload on Markdown updates
				server.watcher.add("content");
				server.watcher.on("change", (path) => {
					if (path.endsWith(".md")) {
						app.clearCache(true);
						server.ws.send({
							type: "full-reload",
						});
					}
				});
			},
		},
	],
});
