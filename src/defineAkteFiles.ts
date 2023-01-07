import { pathToFilePath } from "./lib/pathToFilePath";
import type { Awaitable, Empty } from "./types";

type DataFn<TGlobalData, TParams extends string[], TData> = (context: {
	params: Record<TParams[number], string>;
	globalData: TGlobalData;
}) => Awaitable<TData>;

type BulkDataFn<TGlobalData, TData> = (context: {
	globalData: TGlobalData;
}) => Awaitable<Record<string, TData>>;

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

type Files<TGlobalData, TParams extends string[], TData> = {
	path: Path<TParams>;
	extension?: `.${string}`;
	data?: DataFn<TGlobalData, TParams, TData>;
	bulkData?: BulkDataFn<TGlobalData, TData>;
	render: (context: {
		path: string;
		globalData: TGlobalData;
		data: TData;
	}) => Awaitable<string>;
};

export const defineAkteFiles = <
	TGlobalData,
	TParams extends string[] | Empty = Empty,
	TData = Empty,
>(): {
	from: <
		_TGlobalData extends TGlobalData,
		_TParams extends TParams extends Empty
			? _TDataFn extends DataFn<_TGlobalData, string[], unknown>
				? Exclude<keyof Parameters<_TDataFn>[0]["params"], Symbol | number>[]
				: string[]
			: TParams,
		_TData extends TData extends Empty
			? _TDataFn extends DataFn<_TGlobalData, string[], unknown>
				? Awaited<ReturnType<_TDataFn>>
				: _TBulkDataFn extends BulkDataFn<_TGlobalData, unknown>
				? Awaited<ReturnType<_TBulkDataFn>>[keyof Awaited<
						ReturnType<_TBulkDataFn>
				  >]
				: undefined
			: TData,
		_TDataFn extends DataFn<_TGlobalData, string[], unknown> | undefined,
		_TBulkDataFn extends _TDataFn extends DataFn<
			_TGlobalData,
			string[],
			unknown
		>
			? BulkDataFn<_TGlobalData, Awaited<ReturnType<_TDataFn>>> | undefined
			: BulkDataFn<_TGlobalData, unknown> | undefined,
	>(
		file: Files<_TGlobalData, _TParams, _TData>,
	) => AkteFiles<_TGlobalData, _TParams, _TData>;
} => {
	return {
		from: (file) => {
			return new AkteFiles(file);
		},
	};
};

export class AkteFiles<TGlobalData, TParams extends string[], TData> {
	protected files: Files<TGlobalData, TParams, TData>;

	constructor(files: Files<TGlobalData, TParams, TData>) {
		this.files = files;
	}

	async build(args: {
		globalData: TGlobalData;
	}): Promise<Record<string, string>> {
		if (!this.files.bulkData) {
			return {};
		}

		const bulkData = (await this.files.bulkData?.(args)) as Record<
			string,
			TData
		>;

		const promises: Awaitable<[string, string]>[] = [];
		for (const path in bulkData) {
			const data = bulkData[path];

			promises.push(
				// eslint-disable-next-line no-async-promise-executor
				new Promise<[string, string]>(async (resolve, reject) => {
					try {
						const content = await this.files.render({
							path,
							globalData: args.globalData,
							data,
						});

						resolve([
							pathToFilePath({ path, extension: this.files.extension }),
							content,
						]);
					} catch (error) {
						reject(error);
					}
				}),
			);
		}

		const rendered = await Promise.all(Object.values(promises));

		return Object.fromEntries(rendered);
	}
}
