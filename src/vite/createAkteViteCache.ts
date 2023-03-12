import { AkteViteCache } from "./AkteViteCache";

export const createAkteViteCache = (root: string): AkteViteCache => {
	return new AkteViteCache(root);
};
