import { join, resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

import type { Plugin } from "vite";
import httpProxy from "http-proxy";

import { type Options } from "../types";
import { NotFoundError } from "../../errors";

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
				const url = req.url || "";
				let filePath = url.split("?").pop() || "";
				if (filePath.endsWith("/")) {
					filePath = `${filePath}index.html`;
				} else if (!/\.\w+$/.test(filePath)) {
					filePath = `${filePath}.html`;
				}

				const fullFilePath = join(resolve(cacheDirPath), filePath);
				if (!existsSync(fullFilePath)) {
					return next();
				}

				try {
					const file = await options.app.render(url);
					await writeFile(fullFilePath, file);
				} catch (error) {
					if (error instanceof NotFoundError) {
						return next();
					}

					throw error;
				}

				// Rewrite URL
				if (req.url) {
					req.url = filePath;
				}

				console.log(req.url, `http://${req.headers.host}/${options.cacheDir}`);

				proxy.web(req, res, {
					target: `http://${req.headers.host}/${options.cacheDir}`,
				});
			});
		},
	};
};
