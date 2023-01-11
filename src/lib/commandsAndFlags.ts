export const commandsAndFlags = (): string[] => {
	const _commandsAndFlags = process.argv.slice(2);
	if (_commandsAndFlags[0] === "--") {
		_commandsAndFlags.shift();
	}

	return _commandsAndFlags;
};
