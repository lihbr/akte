export const pathToFilePath = (path: string): string => {
	if (/\.(.*)$/.test(path)) {
		return path;
	}

	return path.endsWith("/") ? `${path}index.html` : `${path}.html`;
};
