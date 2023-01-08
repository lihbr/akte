import { AkteApp, type Config } from "./AkteApp";

export const defineAkteApp = <TGlobalData>(
	config: Config<TGlobalData>,
): AkteApp<TGlobalData> => {
	return new AkteApp(config);
};
