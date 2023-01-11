import { AkteApp, type Config } from "./AkteApp";

/**
 * Creates an Akte app from given configuration.
 *
 * @typeParam TGlobalData - Global data type the app should be configured with
 *   (inferred by default)
 * @param config - Configuration to create the Akte app with.
 * @returns The created Akte app.
 */
export const defineAkteApp = <TGlobalData>(
	config: Config<TGlobalData>,
): AkteApp<TGlobalData> => {
	return new AkteApp(config);
};
