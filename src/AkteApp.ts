import { performance } from "node:perf_hooks";
import { dirname, join, resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { type RadixRouter, createRouter } from "radix3";

import { name as pkgName, version as pkgVersion } from "../package.json";
import type { AkteFiles } from "./AkteFiles";
import type { Awaitable, GlobalDataFn } from "./types";
import { NotFoundError } from "./errors";

export type Config<TGlobalData> = {
	files: AkteFiles<TGlobalData>[];
	globalData: GlobalDataFn<TGlobalData>;
	build?: {
		outDir?: string;
	};
};

export class AkteApp<TGlobalData = unknown> {
	protected config: Config<TGlobalData>;
	protected isCLI: boolean;

	get pkg(): { name: string; version: string } {
		return {
			name: pkgName,
			version: pkgVersion,
		};
	}

	constructor(config: Config<TGlobalData>) {
		console.log("app constructor");
		this.config = config;

		const [_runner, filePath, ...commandsAndFlags] = process.argv;

		const file = filePath.replaceAll("\\", "/").split("/").pop() || "";
		this.isCLI = file.includes("akte.app") || file.includes("akte.config");

		if (this.isCLI) {
			this.runAsCLI(commandsAndFlags);
		}
	}

	async runAsCLI(commandsAndFlags: string[]): Promise<void> {
		process.title = "Akte CLI";

		if (commandsAndFlags[0] === "--") {
			commandsAndFlags.shift();
		}

		// Global flags
		if (
			commandsAndFlags.includes("--help") ||
			commandsAndFlags.includes("-h") ||
			commandsAndFlags.length === 0
		) {
			this.cli.help();

			return process.exit(0);
		} else if (
			commandsAndFlags.includes("--version") ||
			commandsAndFlags.includes("-v")
		) {
			this.cli.version();

			return process.exit(0);
		}

		// Commands
		switch (commandsAndFlags[0]) {
			case "build":
				await this.cli.build();

				return process.exit(0);

			default:
				this.cli.error(
					`Akte → Unknown command \`${commandsAndFlags[0]}\`, use \`--help\` flag for manual`,
				);

				process.exit(2);
		}
	}

	async render(path: string): Promise<string> {
		const match = this.getRouter().lookup(path);

		if (!match) {
			throw new NotFoundError(path);
		}

		const params: Record<string, string> = match.params || {};
		const globalData = await this.getGlobalDataPromise();

		try {
			return match.file.render({ path, params, globalData });
		} catch (error) {
			console.error(error);

			throw new NotFoundError(path);
		}
	}

	async renderAll(): Promise<Record<string, string>> {
		const globalData = await this.getGlobalDataPromise();

		const renderAll = async (
			akteFiles: AkteFiles<TGlobalData>,
		): Promise<Record<string, string>> => {
			try {
				const files = await akteFiles.renderAll({ globalData });

				return files;
			} catch (error) {
				console.error("Akte → Failed to build %o\n", akteFiles.identifier);

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
					console.warn(
						"  Multiple files built %o, only the first one is preserved",
						path,
					);
					continue;
				}

				files[path] = rawFiles[path];
			}
		}

		return files;
	}

	async writeAll(args: {
		outDir?: string;
		files: Record<string, string>;
	}): Promise<void> {
		const outDir = args.outDir ?? this.config.build?.outDir ?? "dist";
		const outDirPath = resolve(outDir);

		const write = async (path: string, content: string): Promise<void> => {
			const filePath = join(outDirPath, path);
			const fileDir = dirname(filePath);

			try {
				await mkdir(fileDir, { recursive: true });
				await writeFile(filePath, content, "utf-8");
			} catch (error) {
				console.error("Akte → Failed to write %o\n", path);

				throw error;
			}

			this.cli.log("  %o", path);
		};

		const promises: Promise<void>[] = [];
		for (const path in args.files) {
			promises.push(write(path, args.files[path]));
		}

		await Promise.all(promises);
	}

	async buildAll(args?: { outDir?: string }): Promise<string[]> {
		const files = await this.renderAll();
		await this.writeAll({ ...args, files });

		return Object.keys(files);
	}

	protected cli = {
		help: (): void => {
			this.cli.log(`
  Akte CLI

  DOCUMENTATION
    https://akte.lihbr.com

  VERSION
    ${pkgName}@${pkgVersion}

  USAGE
    $ npx tsx akte.config.ts

  COMMANDS
    build          Build Akte to file system

  OPTIONS
    --help, -h     Display CLI help
    --version, -v  Display CLI version
`);
		},
		version: (): void => {
			this.cli.log(`${this.pkg.name}@${this.pkg.version}`);
		},
		build: async (): Promise<void> => {
			this.cli.log("\nAkte → Beginning build...\n");

			await this.buildAll();

			const buildTime = `${Math.ceil(performance.now())}ms`;
			this.cli.log("\nAkte → Built in %o", buildTime);
		},
		log: ((message, ...optionalParams) => {
			// eslint-disable-next-line no-console
			this.isCLI && console.log(message, ...optionalParams);
		}) as typeof console.log,
		warn: ((message, ...optionalParams) => {
			this.isCLI && console.warn(message, ...optionalParams);
		}) as typeof console.warn,
		error: ((message, ...optionalParams) => {
			this.isCLI && console.error(message, ...optionalParams);
		}) as typeof console.error,
	};

	clearCache(alsoClearFileCache = false): void {
		this._globalDataPromise = undefined;
		this._router = undefined;

		if (alsoClearFileCache) {
			for (const file of this.config.files) {
				file.clearCache();
			}
		}
	}

	private _globalDataPromise: Awaitable<TGlobalData> | undefined;
	protected getGlobalDataPromise(): Awaitable<TGlobalData> {
		if (!this._globalDataPromise) {
			this._globalDataPromise = this.config.globalData();
		}

		return this._globalDataPromise;
	}

	private _router: RadixRouter<{ file: AkteFiles<TGlobalData> }> | undefined;
	protected getRouter(): RadixRouter<{ file: AkteFiles<TGlobalData> }> {
		if (!this._router) {
			const router = createRouter<{ file: AkteFiles<TGlobalData> }>();

			for (const file of this.config.files) {
				router.insert(file.path, { file });
			}

			this._router = router;
		}

		return this._router;
	}
}
