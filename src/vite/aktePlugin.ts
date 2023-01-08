import { type PluginOption } from "vite";

import { serverPlugin } from "./plugins/serverPlugin";
import { buildPlugin } from "./plugins/buildPlugin";
import { type Options } from "./types";

const DEFAULT_OPTIONS = {
	cacheDir: ".akte",
};

export const aktePlugin = (rawOptions: Options): PluginOption[] => {
	const options: Required<Options> = {
		...DEFAULT_OPTIONS,
		...rawOptions,
	};

	return [serverPlugin(options), buildPlugin(options)];
};
