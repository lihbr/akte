import { performance } from "node:perf_hooks";
import { resolve } from "node:path";

import type { Plugin } from "vite";

import { type Options } from "../types";

export const buildPlugin = async (
	options: Required<Options>,
): Promise<Plugin | null> => {
	return {
		name: "akte:build",
		enforce: "post",
		config: async (userConfig, env) => {
			userConfig.build ||= {};
			userConfig.build.rollupOptions ||= {};

			if (env.mode === "test") {
				return;
			}

			const cacheDirPath = resolve(userConfig.root || ".", options.cacheDir);

			const then = performance.now();
			const filePaths = await options.app.buildAll({
				outDir: cacheDirPath,
			});
			const buildTime = Math.ceil(performance.now() - then);

			const relativeFilePaths = filePaths.map((filePath) =>
				filePath.replace(/^\.?\//, ""),
			);

			// eslint-disable-next-line no-console
			console.log(
				`akte/vite v${options.app.pkg.version} built in ${buildTime}ms`,
			);

			const input: Record<string, string> = {};
			for (const filePath of relativeFilePaths) {
				if (filePath.endsWith(".html")) {
					input[filePath] = resolve(cacheDirPath, filePath);
				}
			}

			userConfig.build ||= {};
			userConfig.build.rollupOptions ||= {};
			userConfig.build.rollupOptions.input = input;

			return userConfig;
		},
		generateBundle(_, outputBundle) {
			for (const bundle of Object.values(outputBundle)) {
				if (
					bundle.type === "asset" &&
					typeof bundle.source === "string" &&
					/\.html$/.test(bundle.fileName)
				) {
					bundle.fileName = bundle.fileName.replace(
						new RegExp(`^${options.cacheDir}\\/?`),
						"",
					);
				}
			}
		},
	};
};
