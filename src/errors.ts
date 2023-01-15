/**
 * Indicates that the file could not be rendered. If the `cause` property is
 * undefined, this error can be considered as a pure 404, otherwise it can be a
 * 500.
 */
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
