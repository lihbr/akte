import { dirname, join, resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import type { Plugin } from "vite";
import httpProxy from "http-proxy";

import type { ResolvedOptions } from "../types";
import { createAkteViteCache } from "../createAkteViteCache";
import { NotFoundError } from "../../errors";
import { pathToFilePath } from "../../lib/pathToFilePath";
import { createDebugger } from "../../lib/createDebugger";

const debug = createDebugger("akte:vite:server", true);

export const serverPlugin = <TGlobalData>(
	options: ResolvedOptions<TGlobalData>,
): Plugin | null => {
	debug("plugin registered");

	let cache = createAkteViteCache(resolve(options.cacheDir));

	return {
		name: "akte:server",
		configResolved(config) {
			cache = createAkteViteCache(resolve(config.root, options.cacheDir));
		},
		configureServer(server) {
			const proxy = httpProxy.createProxyServer();

			type Match = Parameters<typeof options.app.render>[0] & {
				filePath: string;
			};

			const build = async (match: Match): Promise<void> => {
				const file = await options.app.render(match);

				const filePath = join(cache.dir.render, match.filePath);
				const fileDir = dirname(filePath);

				await mkdir(fileDir, { recursive: true });
				await writeFile(filePath, file);

				// Cache global data if cache wasn't hit
				if (!match.globalData) {
					const globalData = await options.app.globalDataCache;
					cache.setAppGlobalData(globalData);
				}

				// Cache data if cache wasn't hit
				if (!match.data) {
					const data = await match.file.dataMapCache.get(match.path);
					cache.setFileData(match.path, data);
				}
			};

			const revalidateCache = async (match: Match): Promise<void> => {
				// Current global data is needed for both revalidation
				const currentGlobalData = await options.app.getGlobalData();

				// Revalidate global data if cache was used
				if (match.globalData) {
					const previousGlobalDataString = JSON.stringify(match.globalData);
					const currentGlobalDataString = JSON.stringify(currentGlobalData);

					if (previousGlobalDataString !== currentGlobalDataString) {
						debug("app %o changed, reloading page...", "globalData");

						await cache.setAppGlobalData(currentGlobalData);

						return server.ws.send({ type: "full-reload" });
					}
				}

				// Revalidate data if cache was used
				if (match.data) {
					const previousDataString = JSON.stringify(match.data);
					const currentData = await match.file.getData({
						path: match.path,
						params: match.params || {},
						globalData: currentGlobalData,
					});
					const currentDataString = JSON.stringify(currentData);

					if (previousDataString !== currentDataString) {
						// TODO: Investigate why this is ran twice
						debug("file %o changed, reloading page...", "data");

						await cache.setFileData(match.path, currentData);

						return server.ws.send({ type: "full-reload" });
					}
				}
			};

			server.middlewares.use(async (req, res, next) => {
				const path = req.url?.split("?").shift() || "";

				// Skipping obvious unrelated paths
				if (
					path.startsWith("/.akte") ||
					path.startsWith("/@vite") ||
					path.startsWith("/@fs")
				) {
					return next();
				}

				let match: Match;
				try {
					match = {
						...options.app.lookup(path),
						filePath: pathToFilePath(path),
					};

					try {
						match.globalData =
							(await cache.getAppGlobalData()) as typeof match.globalData;
					} catch (error) {
						// noop
					}

					try {
						match.data = await cache.getFileData(path);
					} catch (error) {
						// noop
					}

					await build(match);
				} catch (error) {
					if (error instanceof NotFoundError) {
						return next();
					}

					throw error;
				}

				// Rewrite URL
				if (req.url) {
					req.url = match.filePath;
				}

				proxy.web(req, res, {
					target: `http://${req.headers.host}/${options.cacheDir}/render`,
				});

				// Revalidate cache if cache was used
				if (match.globalData || match.data) {
					revalidateCache(match);
				}
			});
		},
	};
};
