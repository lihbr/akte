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
				const path = req.url || "";
				const filePath = pathToFilePath(path.split("?").shift() || "");

				// Skipping obvious unrelated paths
				if (
					path.startsWith("/.akte") ||
					path.startsWith("/@vite") ||
					path.startsWith("/@fs")
				) {
					return next();
				}

				let match: ReturnType<typeof options.app.lookup>;
				try {
					match = options.app.lookup(path);
				} catch (error) {
					if (error instanceof NotFoundError) {
						return next();
					}

					throw error;
				}

				const file = await options.app.render(match);
				await writeFile(join(cacheDirPath, filePath), file);

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
