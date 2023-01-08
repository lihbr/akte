export class NotFoundError extends Error {
	path: string;

	constructor(path: string) {
		super(`Could lookup file for path \`${path}\``);

		this.path = path;
	}
}
