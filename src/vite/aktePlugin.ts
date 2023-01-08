import { type PluginOption } from "vite";

import { createDebugger } from "../lib/createDebugger";
import { serverPlugin } from "./plugins/serverPlugin";
import { buildPlugin } from "./plugins/buildPlugin";
import { type Options } from "./types";

const DEFAULT_OPTIONS = {
	cacheDir: ".akte",
};

const debug = createDebugger("akte:vite", true);

export const aktePlugin = <TGlobalData>(
	rawOptions: Options<TGlobalData>,
): PluginOption[] => {
	debug("plugin registered");

	const options: Required<Options<TGlobalData>> = {
		...DEFAULT_OPTIONS,
		...rawOptions,
	};

	return [serverPlugin(options), buildPlugin(options)];
};
