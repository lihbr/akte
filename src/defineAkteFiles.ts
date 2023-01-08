import {
	AkteFiles,
	type FilesBulkDataFn,
	type FilesDataFn,
	type FilesDefinition,
} from "./AkteFiles";

import type { Empty } from "./types";

export const defineAkteFiles = <
	TGlobalData,
	TParams extends string[] | Empty = Empty,
	TData = Empty,
>(): {
	from: <
		_TGlobalData extends TGlobalData,
		_TParams extends TParams extends Empty
			? _TDataFn extends FilesDataFn<_TGlobalData, string[], unknown>
				? Exclude<keyof Parameters<_TDataFn>[0]["params"], Symbol | number>[]
				: string[]
			: TParams,
		_TData extends TData extends Empty
			? _TDataFn extends FilesDataFn<_TGlobalData, string[], unknown>
				? Awaited<ReturnType<_TDataFn>>
				: _TBulkDataFn extends FilesBulkDataFn<_TGlobalData, unknown>
				? Awaited<ReturnType<_TBulkDataFn>>[keyof Awaited<
						ReturnType<_TBulkDataFn>
				  >]
				: undefined
			: TData,
		_TDataFn extends FilesDataFn<_TGlobalData, string[], unknown> | undefined,
		_TBulkDataFn extends _TDataFn extends FilesDataFn<
			_TGlobalData,
			string[],
			unknown
		>
			? FilesBulkDataFn<_TGlobalData, Awaited<ReturnType<_TDataFn>>> | undefined
			: FilesBulkDataFn<_TGlobalData, unknown> | undefined,
	>(
		definition: FilesDefinition<_TGlobalData, _TParams, _TData>,
	) => AkteFiles<_TGlobalData, _TParams, _TData>;
} => {
	return {
		from: (definition) => {
			return new AkteFiles(definition);
		},
	};
};
