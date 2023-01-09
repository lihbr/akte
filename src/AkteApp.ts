import { dirname, join, resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { type MatchedRoute, type RadixRouter, createRouter } from "radix3";

import type { AkteFiles } from "./AkteFiles";
import type { Awaitable, GlobalDataFn } from "./types";
import { NotFoundError } from "./errors";
import { runCLI } from "./runCLI";

import { createDebugger } from "./lib/createDebugger";
import { pathToRouterPath } from "./lib/pathToRouterPath";
import { isCLI } from "./lib/isCLI";

export type Config<TGlobalData> = {
	files: AkteFiles<TGlobalData>[];
	build?: {
		outDir?: string;
	};
	// Most global data will eventually be objects we use this
	// assumption to make mandatory or not the `globalData` method
} & (TGlobalData extends Record<string | number | symbol, unknown>
	? {
			globalData: GlobalDataFn<TGlobalData>;
	  }
	: {
			globalData?: GlobalDataFn<TGlobalData>;
	  });

const debug = createDebugger("akte:app");
const debugWrite = createDebugger("akte:app:write");
const debugRender = createDebugger("akte:app:render");
const debugRouter = createDebugger("akte:app:router");
const debugCache = createDebugger("akte:app:cache");

export class AkteApp<TGlobalData = unknown> {
	protected config: Config<TGlobalData>;

	constructor(config: Config<TGlobalData>) {
		this.config = config;

		debug("created with %o files", this.config.files.length);

		if (isCLI) {
			runCLI(this as AkteApp);
		}
	}

	lookup(path: string): MatchedRoute<{
		file: AkteFiles<TGlobalData>;
	}> & { path: string } {
		const pathWithExtension = pathToRouterPath(path);
		debugRouter("looking up %o (%o)", path, pathWithExtension);

		const maybeMatch = this.getRouter().lookup(pathWithExtension);

		if (!maybeMatch || !maybeMatch.file) {
			debugRouter("not found %o", path);
			throw new NotFoundError(path);
		}

		return {
			...maybeMatch,
			path,
		};
	}

	async render(
		match: MatchedRoute<{
			file: AkteFiles<TGlobalData>;
		}> & { path: string },
	): Promise<string> {
		debugRender("rendering %o...", match.path);

		const params: Record<string, string> = match.params || {};
		const globalData = await this.getGlobalDataPromise();

		try {
			const content = match.file.render({
				path: match.path,
				params,
				globalData,
			});

			debugRender("rendered %o", match.path);

			return content;
		} catch (error) {
			debugRender.error(error);

			throw new NotFoundError(match.path);
		}
	}

	async renderAll(): Promise<Record<string, string>> {
		debugRender("rendering all files...");

		const globalData = await this.getGlobalDataPromise();

		const renderAll = async (
			akteFiles: AkteFiles<TGlobalData>,
		): Promise<Record<string, string>> => {
			try {
				const files = await akteFiles.renderAll({ globalData });

				return files;
			} catch (error) {
				debug.error("Akte → Failed to build %o\n", akteFiles.path);

				throw error;
			}
		};

		const promises: Promise<Record<string, string>>[] = [];
		for (const akteFiles of this.config.files) {
			promises.push(renderAll(akteFiles));
		}

		const rawFilesArray = await Promise.all(promises);

		const files: Record<string, string> = {};
		for (const rawFiles of rawFilesArray) {
			for (const path in rawFiles) {
				if (path in files) {
					debug.warn(
						"  Multiple files built %o, only the first one is preserved",
						path,
					);
					continue;
				}

				files[path] = rawFiles[path];
			}
		}

		const rendered = Object.keys(files).length;
		debugRender(
			`done, %o ${rendered > 1 ? "files" : "file"} rendered`,
			rendered,
		);

		return files;
	}

	async writeAll(args: {
		outDir?: string;
		files: Record<string, string>;
	}): Promise<void> {
		debugWrite("writing all files...");
		const outDir = args.outDir ?? this.config.build?.outDir ?? "dist";
		const outDirPath = resolve(outDir);

		const write = async (path: string, content: string): Promise<void> => {
			const filePath = join(outDirPath, path);
			const fileDir = dirname(filePath);

			try {
				await mkdir(fileDir, { recursive: true });
				await writeFile(filePath, content, "utf-8");
			} catch (error) {
				debug.error("Akte → Failed to write %o\n", path);

				throw error;
			}

			debugWrite("%o", path);
			debugWrite.log("  %o", path);
		};

		const promises: Promise<void>[] = [];
		for (const path in args.files) {
			promises.push(write(path, args.files[path]));
		}

		await Promise.all(promises);

		debugWrite(
			`done, %o ${promises.length > 1 ? "files" : "file"} written`,
			promises.length,
		);
	}

	async buildAll(args?: { outDir?: string }): Promise<string[]> {
		const files = await this.renderAll();
		await this.writeAll({ ...args, files });

		return Object.keys(files);
	}

	clearCache(alsoClearFileCache = false): void {
		debugCache("clearing...");

		this._globalDataPromise = undefined;
		this._router = undefined;

		if (alsoClearFileCache) {
			for (const file of this.config.files) {
				file.clearCache();
			}
		}

		debugCache("cleared");
	}

	private _globalDataPromise: Awaitable<TGlobalData> | undefined;
	protected getGlobalDataPromise(): Awaitable<TGlobalData> {
		if (!this._globalDataPromise) {
			debugCache("retrieving global data...");
			const globalDataPromise =
				this.config.globalData?.() ?? (undefined as TGlobalData);

			if (globalDataPromise instanceof Promise) {
				globalDataPromise.then(() => {
					debugCache("retrieved global data");
				});
			} else {
				debugCache("retrieved global data");
			}

			this._globalDataPromise = globalDataPromise;
		} else {
			debugCache("using cached global data");
		}

		return this._globalDataPromise;
	}

	private _router:
		| RadixRouter<{
				file: AkteFiles<TGlobalData>;
		  }>
		| undefined;

	protected getRouter(): RadixRouter<{
		file: AkteFiles<TGlobalData>;
	}> {
		if (!this._router) {
			debugCache("creating router...");
			const router = createRouter<{ file: AkteFiles<TGlobalData> }>();

			for (const file of this.config.files) {
				const path = pathToRouterPath(file.path);
				router.insert(pathToRouterPath(file.path), { file });
				debugRouter("registered %o", path);
				if (file.path.endsWith("/**")) {
					const catchAllPath = pathToRouterPath(
						file.path.replace(/\/\*\*$/, ""),
					);
					router.insert(catchAllPath, {
						file,
					});
					debugRouter("registered %o", catchAllPath);
					debugCache(pathToRouterPath(file.path.replace(/\/\*\*$/, "")));
				}
			}

			this._router = router;
			debugCache("created router");
		} else {
			debugCache("using cached router");
		}

		return this._router;
	}
}
