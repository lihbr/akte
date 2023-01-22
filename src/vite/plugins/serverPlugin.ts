import { join, resolve } from "node:path";
import { writeFile } from "node:fs/promises";

import type { Plugin } from "vite";
import httpProxy from "http-proxy";

import type { ResolvedOptions } from "../types";
import { NotFoundError } from "../../errors";
import { pathToFilePath } from "../../lib/pathToFilePath";
import { createDebugger } from "../../lib/createDebugger";

const debug = createDebugger("akte:vite:server", true);

export const serverPlugin = <TGlobalData>(
	options: ResolvedOptions<TGlobalData>,
): Plugin | null => {
	debug("plugin registered");

	let cacheDirPath = resolve(options.cacheDir);

	return {
		name: "akte:server",
		configResolved(config) {
			cacheDirPath = resolve(config.root, options.cacheDir);
		},
		configureServer(server) {
			const proxy = httpProxy.createProxyServer();

			server.middlewares.use(async (req, res, next) => {
				const path = req.url?.split("?").shift() || "";
				const filePath = pathToFilePath(path);

				// Skipping obvious unrelated paths
				if (
					path.startsWith("/.akte") ||
					path.startsWith("/@vite") ||
					path.startsWith("/@fs")
				) {
					return next();
				}

				try {
					const match = options.app.lookup(path);
					const file = await options.app.render(match);
					await writeFile(join(cacheDirPath, filePath), file);
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

				proxy.web(req, res, {
					target: `http://${req.headers.host}/${options.cacheDir}`,
				});
			});
		},
	};
};
