import { dirname, resolve } from "node:path";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

import type { AkteFiles } from "../AkteFiles";
import { type Awaitable } from "../types";
import { pathToFilePath } from "../lib/pathToFilePath";

const GLOBAL_DATA = "app.globalData";
const DATA = "file.data";

export class AkteViteCache {
	get dir(): { root: string; data: string; render: string } {
		return this._dir;
	}

	private _dir: { root: string; data: string; render: string };

	constructor(root: string) {
		this._dir = {
			root,
			data: resolve(root, "data"),
			render: resolve(root, "render"),
		};
	}

	async getAppGlobalData(): Promise<unknown> {
		const globalDataRaw = await this.get("data", GLOBAL_DATA);

		return JSON.parse(globalDataRaw).globalData;
	}

	async setAppGlobalData(globalData: unknown): Promise<void> {
		// Updating global data invalidates all cache
		await rm(this._dir.data, { recursive: true });

		const globalDataRaw = JSON.stringify({ globalData });

		return this.set("data", GLOBAL_DATA, globalDataRaw);
	}

	async getFileData(path: string): Promise<unknown> {
		const dataRaw = await this.get("data", `${pathToFilePath(path)}.${DATA}`);

		return JSON.parse(dataRaw).data;
	}

	async setFileData(path: string, data: unknown): Promise<void> {
		const dataRaw = JSON.stringify({ data });

		return this.set("data", `${pathToFilePath(path)}.${DATA}`, dataRaw);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async setFileDataMap(file: AkteFiles<any>): Promise<void> {
		if (file.dataMapCache.size === 0 && !file.bulkDataCache) {
			return;
		}

		const set = async (
			dataCache: Awaitable<unknown>,
			path: string,
		): Promise<void> => {
			const data = await dataCache;
			const dataRaw = JSON.stringify({ data });

			this.set("data", `${pathToFilePath(path)}.${DATA}`, dataRaw);
		};

		const promises: Promise<void>[] = [];

		if (file.bulkDataCache) {
			const bulkData = await file.bulkDataCache;
			Object.entries(bulkData).forEach(([path, dataCache]) => {
				promises.push(set(dataCache, path));
			});
		} else {
			file.dataMapCache.forEach((dataCache, path) => {
				promises.push(set(dataCache, path));
			});
		}

		await Promise.all(promises);
	}

	protected delete(type: "data" | "render", id: string): Promise<void> {
		return rm(resolve(this._dir[type], `./${id}`));
	}

	protected get(type: "data" | "render", id: string): Promise<string> {
		return readFile(resolve(this._dir[type], `./${id}`), "utf-8");
	}

	protected async set(
		type: "data" | "render",
		id: string,
		data: string,
	): Promise<void> {
		const path = resolve(this._dir[type], `./${id}`);
		const dir = dirname(path);

		await mkdir(dir, { recursive: true });

		return writeFile(path, data, "utf-8");
	}
}
