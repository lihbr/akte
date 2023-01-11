import {
	AkteFiles,
	type FilesBulkDataFn,
	type FilesDataFn,
	type FilesDefinition,
} from "./AkteFiles";

import type { Empty } from "./types";

/**
 * Creates an Akte files instance.
 *
 * @example
 * 	const posts = defineAkteFiles().from({
 * 		path: "/posts/:slug",
 * 		bulkData() {
 * 			return {
 * 				"/posts/foo": {},
 * 				"/posts/bar": {},
 * 				"/posts/baz": {},
 * 			};
 * 		},
 * 		render(context) {
 * 			return "...";
 * 		},
 * 	});
 *
 * @typeParam TGlobalData - Global data the Akte files expects.
 * @typeParam TParams - Parameters the Akte files expects.
 * @typeParam TData - Data the Akte files expects (inferred by default)
 * @returns A factory to create the Akte files from.
 */
export const defineAkteFiles = <
	TGlobalData,
	TParams extends string[] | Empty = Empty,
	TData = Empty,
>(): {
	/**
	 * Creates an Akte files instance from a definition.
	 *
	 * @param definition - The definition to create the instance from.
	 * @returns The created Akte files.
	 */
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
