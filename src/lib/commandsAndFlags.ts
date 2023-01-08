const _commandsAndFlags = process.argv.slice(2);
if (_commandsAndFlags[0] === "--") {
	_commandsAndFlags.shift();
}

export const commandsAndFlags = _commandsAndFlags;
