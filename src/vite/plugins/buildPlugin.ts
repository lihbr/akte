import { performance } from "node:perf_hooks";
import { dirname, posix, resolve } from "node:path";
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

import type { Plugin } from "vite";

import type { ResolvedOptions } from "../types";
import { pkg } from "../../lib/pkg";
import { createDebugger } from "../../lib/createDebugger";

let isServerRestart = false;

const debug = createDebugger("akte:vite:build", true);

export const buildPlugin = <TGlobalData>(
	options: ResolvedOptions<TGlobalData>,
): Plugin | null => {
	debug("plugin registered");

	let cacheDirPath = resolve(options.cacheDir);
	let relativeFilePaths: string[] = [];
	let outDir = "dist";

	return {
		name: "akte:build",
		enforce: "post",
		config: async (userConfig, env) => {
			if (env.mode === "test") {
				debug("mode %o detected, skipping rollup config update", env.mode);

				return;
			}

			debug("updating rollup config...");

			userConfig.build ||= {};
			userConfig.build.rollupOptions ||= {};

			cacheDirPath = resolve(userConfig.root || ".", options.cacheDir);

			// Don't build full app directly in dev mode
			const indexHTMLPath = resolve(cacheDirPath, "index.html");
			if (
				env.mode === "development" &&
				env.command === "serve" &&
				existsSync(indexHTMLPath) &&
				isServerRestart
			) {
				debug("server restart detected, skipping full build");
				userConfig.build.rollupOptions.input = {
					"index.html": indexHTMLPath,
				};

				debug("updated rollup config");
			}

			const then = performance.now();
			const filePaths = await options.app.buildAll({
				outDir: cacheDirPath,
			});
			const buildTime = Math.ceil(performance.now() - then);

			relativeFilePaths = filePaths.map((filePath) =>
				filePath.replace(/^\.?\//, ""),
			);

			debug.log(`akte/vite v${pkg.version} built in ${buildTime}ms`);

			const input: Record<string, string> = {};
			for (const filePath of relativeFilePaths) {
				if (filePath.endsWith(".html")) {
					input[filePath] = resolve(cacheDirPath, filePath);
					debug(
						"registered %o as rollup input",
						posix.join(userConfig.root || ".", options.cacheDir, filePath),
					);
				}
			}

			userConfig.build.rollupOptions.input = input;

			isServerRestart = true;

			debug("updated rollup config");

			return userConfig;
		},
		configResolved(config) {
			outDir = resolve(config.root, config.build.outDir);
		},
		async generateBundle(_, outputBundle) {
			debug("updating akte bundle...");

			const operations = ["fixed html file paths"];
			if (options.minifyHTML) {
				operations.push("minified html");
			}

			let _minify = ((str: string) =>
				Promise.resolve(str)) as typeof import("html-minifier-terser").minify;
			if (options.minifyHTML) {
				try {
					_minify = (await import("html-minifier-terser")).minify;
				} catch (error) {
					debug.error(
						"\nAkte → %o is required to minify HTML, install it or disable the %o option on the Vite plugin\n",
						"html-minifier-terser",
						"minifyHTML",
					);
					throw error;
				}
			}

			const minify = async (partialBundle: {
				source: string | Uint8Array;
			}): Promise<void> => {
				partialBundle.source = await _minify(
					partialBundle.source as string,
					options.minifyHTML || {},
				);
			};

			const promises: Promise<void>[] = [];
			for (const bundle of Object.values(outputBundle)) {
				if (
					bundle.type === "asset" &&
					typeof bundle.source === "string" &&
					relativeFilePaths.find((relativeFilePath) =>
						bundle.fileName.endsWith(relativeFilePath),
					)
				) {
					// Rewrite filename to be neither relative or absolute
					bundle.fileName = bundle.fileName.replace(
						new RegExp(`^${options.cacheDir}\\/?`),
						"",
					);

					if (options.minifyHTML) {
						promises.push(minify(bundle));
					}
				}
			}
			debug(`updated akte bundle: ${operations.join(", ")}`);
		},
		async writeBundle() {
			const filePaths = relativeFilePaths.filter(
				(filePath) => !filePath.endsWith(".html"),
			);

			if (!filePaths.length) {
				debug("no non-html files to copy");
			}

			debug("copying non-html files to output directory...");

			const copy = async (filePath: string): Promise<void> => {
				const src = resolve(cacheDirPath, filePath);
				const dest = resolve(outDir, filePath);
				const destDir = dirname(dest);

				await mkdir(destDir, { recursive: true });
				await copyFile(src, dest);
				debug("copied %o to output directory", filePath);
			};

			const promises: Promise<void>[] = [];
			for (const filePath of filePaths) {
				promises.push(copy(filePath));
			}

			await Promise.all(promises);

			debug(
				`copied %o non-html ${
					promises.length > 1 ? "files" : "file"
				} to output directory`,
				promises.length,
			);
		},
	};
};
