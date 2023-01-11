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

/**
 * Creates an Akte files instance for a single file.
 *
 * @example
 * 	const posts = defineAkteFile().from({
 * 		path: "/about",
 * 		data() {
 * 			return {};
 * 		},
 * 		render(context) {
 * 			return "...";
 * 		},
 * 	});
 *
 * @typeParam TGlobalData - Global data the Akte files expects.
 * @typeParam TData - Data the Akte files expects (inferred by default)
 * @returns A factory to create the Akte files from.
 */
export const defineAkteFile = <TGlobalData, TData = Empty>(): {
	/**
	 * Creates an Akte files instance for a single file from a definition.
	 *
	 * @param definition - The definition to create the instance from.
	 * @returns The created Akte files.
	 */
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
			type _FileDataFn = Required<typeof definition>["data"];

			// Allows single file to still get build without any data function
			const data = (() => {}) as unknown as _FileDataFn;

			const bulkData: FilesBulkDataFn<
				Parameters<_FileDataFn>[0]["globalData"],
				Awaited<ReturnType<_FileDataFn>>
			> = async (args) => {
				if (definition.data) {
					return {
						[definition.path]: await definition.data({
							path: definition.path,
							params: {},
							globalData: args.globalData,
						}),
					};
				}

				return { [definition.path]: {} as Awaited<ReturnType<_FileDataFn>> };
			};

			return new AkteFiles({
				data,
				...definition,
				bulkData,
			});
		},
	};
};
