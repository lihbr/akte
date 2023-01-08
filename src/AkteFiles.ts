import { pathToFilePath } from "./lib/pathToFilePath";
import { type Awaitable } from "./types";

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
	params: Record<TParams[number], string>;
	globalData: TGlobalData;
}) => Awaitable<TData>;

export type FilesBulkDataFn<TGlobalData, TData> = (context: {
	globalData: TGlobalData;
}) => Awaitable<Record<string, TData>>;

export type FilesDefinition<TGlobalData, TParams extends string[], TData> = {
	path: Path<TParams>;
	extension?: `.${string}`;
	data?: FilesDataFn<TGlobalData, TParams, TData>;
	bulkData?: FilesBulkDataFn<TGlobalData, TData>;
	render: (context: {
		path: string;
		globalData: TGlobalData;
		data: TData;
	}) => Awaitable<string>;
};

export class AkteFiles<
	TGlobalData = unknown,
	TParams extends string[] = string[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TData = any,
> {
	protected definition: FilesDefinition<TGlobalData, TParams, TData>;

	get path(): string {
		if (this.definition.extension && this.definition.extension !== ".html") {
			return `${this.definition.path}${this.definition.extension}`;
		}

		return this.definition.path;
	}

	get identifier(): string {
		return pathToFilePath(this.definition);
	}

	constructor(definition: FilesDefinition<TGlobalData, TParams, TData>) {
		this.definition = definition;
	}

	async render(args: {
		path: string;
		params: Record<TParams[number], string>;
		globalData: TGlobalData;
	}): Promise<string> {
		const data = (await this.definition.data?.(args)) as TData;

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
			return {};
		}

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

			return [
				pathToFilePath({ path, extension: this.definition.extension }),
				content,
			];
		};

		const promises: Awaitable<[string, string]>[] = [];
		for (const path in bulkData) {
			const data = bulkData[path];

			promises.push(render(path, data));
		}

		const fileEntries = await Promise.all(Object.values(promises));

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
		const key = JSON.stringify(context.params);

		const maybePromise = this._dataPromiseMap.get(key);
		if (maybePromise) {
			return maybePromise;
		}

		const promise =
			this.definition.data?.(context) || (undefined as Awaitable<TData>);
		this._dataPromiseMap.set(key, promise);

		return promise;
	};

	private _bulkDataPromise: Awaitable<Record<string, TData>> | undefined;

	protected getBulkDataPromise: FilesBulkDataFn<TGlobalData, TData> = (
		context,
	) => {
		if (!this._bulkDataPromise) {
			this._bulkDataPromise =
				this.definition.bulkData?.(context) ||
				({} as Awaitable<Record<string, TData>>);
		}

		return this._bulkDataPromise;
	};
}
