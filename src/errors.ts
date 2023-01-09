export class NotFoundError extends Error {
	path: string;

	constructor(
		path: string,
		options?: {
			cause?: unknown;
		},
	) {
		super(`Could lookup file for path \`${path}\``, options);

		this.path = path;
	}
}
