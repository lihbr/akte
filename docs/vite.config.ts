import { defineConfig } from "vite";
import akte from "akte/vite";

import { app } from "./akte.app";

export default defineConfig({
	plugins: [
		akte({ app }),
		{
			name: "markdown:watch",
			configureServer(server) {
				// Hot reload on Markdown updates
				server.watcher.add("content/**.md");
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
