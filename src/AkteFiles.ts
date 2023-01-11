import { NotFoundError } from "./errors";
import { type Awaitable } from "./types";

import { createDebugger } from "./lib/createDebugger";
import { pathToFilePath } from "./lib/pathToFilePath";

type Path<
	TParams extends string[],
	TPrefix extends string = string,
> = TParams extends []
	? ""
	: TParams extends [string]
	? `${TPrefix}:${TParams[0]}${string}`
	: TParams extends readonly [string, ...infer Rest extends string[]]
	? Path<Rest, `${TPrefix}:${TParams[0]}${string}`>
	: string;

export type FilesDataFn<
	TGlobalData,
	TParams extends string[],
	TData,
> = (context: {
	path: string;
	params: Record<TParams[number], string>;
	globalData: TGlobalData;
}) => Awaitable<TData>;

export type FilesBulkDataFn<TGlobalData, TData> = (context: {
	globalData: TGlobalData;
}) => Awaitable<Record<string, TData>>;

export type FilesDefinition<TGlobalData, TParams extends string[], TData> = {
	path: Path<TParams>;
	data?: FilesDataFn<TGlobalData, TParams, TData>;
	bulkData?: FilesBulkDataFn<TGlobalData, TData>;
	render: (context: {
		path: string;
		globalData: TGlobalData;
		data: TData;
	}) => Awaitable<string>;
};

const debug = createDebugger("akte:files");
const debugRender = createDebugger("akte:files:render");
const debugCache = createDebugger("akte:files:cache");

export class AkteFiles<
	TGlobalData = unknown,
	TParams extends string[] = string[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TData = any,
> {
	protected definition: FilesDefinition<TGlobalData, TParams, TData>;

	get path(): string {
		return this.definition.path;
	}

	constructor(definition: FilesDefinition<TGlobalData, TParams, TData>) {
		this.definition = definition;

		debug("created %o", this.path);
	}

	async render(args: {
		path: string;
		params: Record<TParams[number], string>;
		globalData: TGlobalData;
	}): Promise<string> {
		const data = await this.getDataPromise(args);

		return this.definition.render({
			path: args.path,
			globalData: args.globalData,
			data,
		});
	}

	async renderAll(args: {
		globalData: TGlobalData;
	}): Promise<Record<string, string>> {
		if (!this.definition.bulkData) {
			debugRender("no files to render %o", this.path);

			return {};
		}

		debugRender("rendering files... %o", this.path);

		const bulkData = await this.getBulkDataPromise(args);

		const render = async (
			path: string,
			data: TData,
		): Promise<[string, string]> => {
			const content = await this.definition.render({
				path,
				globalData: args.globalData,
				data,
			});

			debugRender("rendered %o", path);

			return [pathToFilePath(path), content];
		};

		const promises: Awaitable<[string, string]>[] = [];
		for (const path in bulkData) {
			const data = bulkData[path];

			promises.push(render(path, data));
		}

		const fileEntries = await Promise.all(Object.values(promises));

		debugRender(
			`rendered %o ${fileEntries.length > 1 ? "files" : "file"} %o`,
			fileEntries.length,
			this.path,
		);

		return Object.fromEntries(fileEntries);
	}

	clearCache(): void {
		this._dataPromiseMap = new Map();
		this._bulkDataPromise = undefined;
	}

	private _dataPromiseMap: Map<string, Awaitable<TData>> = new Map();

	protected getDataPromise: FilesDataFn<TGlobalData, TParams, TData> = (
		context,
	) => {
		const maybePromise = this._dataPromiseMap.get(context.path);
		if (maybePromise) {
			debugCache("using cached data %o", context.path);

			return maybePromise;
		}

		debugCache("retrieving data... %o", context.path);

		let promise: Awaitable<TData>;
		if (this.definition.data) {
			promise = this.definition.data(context);
		} else if (this.definition.bulkData) {
			const dataFromBulkData = async (path: string): Promise<TData> => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const bulkData = await this.definition.bulkData!({
					globalData: context.globalData,
				});

				if (path in bulkData) {
					return bulkData[path];
				}

				throw new NotFoundError(path);
			};

			promise = dataFromBulkData(context.path);
		} else {
			throw new Error(
				`Cannot render file for path \`${context.path}\`, no \`data\` or \`bulkData\` function available`,
			);
		}

		if (promise instanceof Promise) {
			promise
				.then(() => {
					debugCache("retrieved data %o", context.path);
				})
				.catch(() => {});
		} else {
			debugCache("retrieved data %o", context.path);
		}

		this._dataPromiseMap.set(context.path, promise);

		return promise;
	};

	private _bulkDataPromise: Awaitable<Record<string, TData>> | undefined;

	protected getBulkDataPromise: FilesBulkDataFn<TGlobalData, TData> = (
		context,
	) => {
		if (!this._bulkDataPromise) {
			debugCache("retrieving bulk data... %o", this.path);

			const bulkDataPromise =
				this.definition.bulkData?.(context) || ({} as Record<string, TData>);

			if (bulkDataPromise instanceof Promise) {
				bulkDataPromise.then(() => {
					debugCache("retrieved bulk data %o", this.path);
				});
			} else {
				debugCache("retrieved bulk data %o", this.path);
			}

			this._bulkDataPromise = bulkDataPromise;
		} else {
			debugCache("using cached bulk data %o", this.path);
		}

		return this._bulkDataPromise;
	};
}
