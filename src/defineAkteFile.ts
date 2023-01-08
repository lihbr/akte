import {
	AkteFiles,
	type FilesBulkDataFn,
	type FilesDataFn,
	type FilesDefinition,
} from "./AkteFiles";
import type { Empty } from "./types";

type FileDefinition<TGlobalData, TData> = Omit<
	FilesDefinition<TGlobalData, never[], TData>,
	"bulkData"
>;

export const defineAkteFile = <TGlobalData, TData = Empty>(): {
	from: <
		_TGlobalData extends TGlobalData,
		_TData extends TData extends Empty
			? _TDataFn extends FilesDataFn<_TGlobalData, never[], unknown>
				? Awaited<ReturnType<_TDataFn>>
				: undefined
			: TData,
		_TDataFn extends FilesDataFn<_TGlobalData, never[], unknown> | undefined,
	>(
		definition: FileDefinition<_TGlobalData, _TData>,
	) => AkteFiles<_TGlobalData, never[], _TData>;
} => {
	return {
		from: (definition) => {
			type FileDataFn = Required<typeof definition>["data"];

			const bulkData: FilesBulkDataFn<
				Parameters<FileDataFn>[0]["globalData"],
				Awaited<ReturnType<FileDataFn>>
			> = async (args) => {
				if (definition.data) {
					return {
						[definition.path]: await definition.data({
							params: {},
							globalData: args.globalData,
						}),
					};
				}

				return { [definition.path]: {} as Awaited<ReturnType<FileDataFn>> };
			};

			return new AkteFiles({
				...definition,
				bulkData,
			});
		},
	};
};
