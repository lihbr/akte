import type { Options as MinifyHTMLOptions } from "html-minifier-terser";

import { type AkteApp } from "../AkteApp";

export type Options<TGlobalData> = {
	app: AkteApp<TGlobalData>;
	cacheDir?: string;
	minifyHTML?: boolean | MinifyHTMLOptions;
};

export type ResolvedOptions<TGlobalData> = {
	app: AkteApp<TGlobalData>;
	cacheDir: string;
	minifyHTML: false | MinifyHTMLOptions;
};
