import { type AkteApp } from "../AkteApp";

export type Options<TGlobalData> = {
	app: AkteApp<TGlobalData>;
	cacheDir?: string;
};
