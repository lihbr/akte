import { dirname, join, resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import type { AkteFile } from "./defineAkteFile";
import type { AkteFiles } from "./defineAkteFiles";
import type { GlobalDataFn } from "./types";

type Config<TGlobalData> = {
	files: // eslint-disable-next-line @typescript-eslint/no-explicit-any
	(AkteFile<TGlobalData, any> | AkteFiles<TGlobalData, any, any>)[];
	globalData: GlobalDataFn<TGlobalData>;
	build?: {
		outDir?: string;
	};
};

export const defineAkteConfig = <TGlobalData>(
	config: Config<TGlobalData>,
): AkteConfig<Config<TGlobalData>> => {
	return new AkteConfig(config);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class AkteConfig<TConfig extends Config<any>> {
	protected config: TConfig;

	constructor(config: TConfig) {
		this.config = config;

		const [_runner, file, command] = process.argv;

		if (
			file.replaceAll("\\", "/").split("/").pop()?.includes("Akte") &&
			command === "build"
		) {
			this.buildCommand();
		}
	}

	protected async buildCommand(): Promise<void> {
		const then = Date.now();

		// eslint-disable-next-line no-console
		console.log("\nAkte → Beginning build...\n");

		const build = await this.buildAll();
		await this.writeAll({ build });

		const buildTime = `${Date.now() - then}ms`;
		// eslint-disable-next-line no-console
		console.log("\nAkte → Built in %o", buildTime);
	}

	async buildAll(): Promise<Record<string, string>[]> {
		const globalData = await this.config.globalData();

		const promises: Promise<Record<string, string>>[] = [];

		for (const fileOrFiles of this.config.files) {
			promises.push(fileOrFiles.build({ globalData }));
		}

		return Promise.all(promises);
	}

	async writeAll(args: { build: Record<string, string>[] }): Promise<void> {
		const outDir = this.config.build?.outDir ?? "dist";
		const outDirPath = resolve(outDir);

		const write = async (path: string, content: string): Promise<void> => {
			const filePath = join(outDirPath, path);
			const fileDir = dirname(filePath);

			await mkdir(fileDir, { recursive: true });
			await writeFile(filePath, content, "utf-8");

			// eslint-disable-next-line no-console
			console.log("  %o", path);
		};

		const writeJobs: Record<string, string> = {};
		for (const files of args.build) {
			for (const path in files) {
				if (path in writeJobs) {
					console.warn(
						"  Multiple files built %o, only the first one will get written",
						path,
					);
					continue;
				}

				writeJobs[path] = files[path];
			}
		}

		const promises: Promise<void>[] = [];
		for (const path in writeJobs) {
			promises.push(write(path, writeJobs[path]));
		}

		await Promise.all(promises);
	}
}
