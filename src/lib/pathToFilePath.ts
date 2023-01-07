export const pathToFilePath = (args: {
	path: string;
	extension?: `.${string}`;
}): string => {
	const path = args.path.endsWith("/") ? `${args.path}index` : args.path;
	const extension = args.extension || ".html";

	return `${path}${extension}`;
};
