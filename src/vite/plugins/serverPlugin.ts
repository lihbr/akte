import { join, resolve } from "node:path";
import { existsSync } from "node:fs";

import type { Plugin } from "vite";
import httpProxy from "http-proxy";

import { type Options } from "../types";

export const serverPlugin = (options: Required<Options>): Plugin | null => {
	let cacheDirPath = join(".", options.cacheDir);

	return {
		name: "akte:server",
		configResolved(config) {
			cacheDirPath = resolve(config.root, options.cacheDir);
		},
		configureServer(server) {
			const proxy = httpProxy.createProxyServer();

			server.middlewares.use(async (req, res, next) => {
				let url = req.url || "";
				if (url.endsWith("/")) {
					url = `${url}index.html`;
				} else if (!/\.\w+$/.test(url)) {
					url = `${url}.html`;
				}

				if (!existsSync(join(resolve(cacheDirPath), url))) {
					return next();
				}

				proxy.web(req, res, { target: `http://${req.headers.host}/.akte` });
			});
		},
	};
};
