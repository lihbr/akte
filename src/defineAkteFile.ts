import { pathToFilePath } from "./lib/pathToFilePath";
import type { Awaitable, Empty } from "./types";

type DataFn<TGlobalData, TData> = (context: {
	globalData: TGlobalData;
}) => Awaitable<TData>;

type File<TGlobalData, TData> = {
	path: string;
	extension?: `.${string}`;
	data?: DataFn<TGlobalData, TData>;
	render: (context: {
		globalData: TGlobalData;
		data: TData;
	}) => Awaitable<string>;
};

export const defineAkteFile = <TGlobalData, TData = Empty>(): {
	from: <
		_TGlobalData extends TGlobalData,
		_TData extends TData extends Empty
			? _TDataFn extends DataFn<_TGlobalData, unknown>
				? Awaited<ReturnType<_TDataFn>>
				: undefined
			: TData,
		_TDataFn extends DataFn<_TGlobalData, unknown> | undefined,
	>(
		file: File<_TGlobalData, _TData>,
	) => AkteFile<_TGlobalData, _TData>;
} => {
	return {
		from: (file) => {
			return new AkteFile(file);
		},
	};
};

export class AkteFile<TGlobalData, TData> {
	protected file: File<TGlobalData, TData>;

	constructor(file: File<TGlobalData, TData>) {
		this.file = file;
	}

	async build(args: {
		globalData: TGlobalData;
	}): Promise<Record<string, string>> {
		const data = (await this.file.data?.(args)) as TData;

		return {
			[pathToFilePath(this.file)]: await this.file.render({
				globalData: args.globalData,
				data,
			}),
		};
	}
}
