export class NotFoundError extends Error {
	path: string;

	constructor(
		path: string,
		options?: {
			cause?: unknown;
		},
	) {
		if (!options?.cause) {
			super(`Could lookup file for path \`${path}\``, options);
		} else {
			super(
				`Could lookup file for path \`${path}\`\n\n${options.cause.toString()}`,
				options,
			);
		}

		this.path = path;
	}
}
