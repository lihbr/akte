import debug from "debug";
import { hasHelp, hasSilent, hasVersion } from "./hasFlag";
import { isCLI } from "./isCLI";

type DebuggerFn = (msg: unknown, ...args: unknown[]) => void;
type Debugger = DebuggerFn & {
	log: DebuggerFn;
	warn: DebuggerFn;
	error: DebuggerFn;
};

const _canLog = isCLI && (!hasSilent() || hasHelp() || hasVersion());

export const createDebugger = (scope: string, canLog = _canLog): Debugger => {
	const _debug = debug(scope);

	const _debugger: Debugger = (msg, ...args) => {
		return _debug(msg, ...args);
	};

	_debugger.log = (msg, ...args) => {
		// eslint-disable-next-line no-console
		canLog && console.log(msg, ...args);
	};

	_debugger.warn = (msg, ...args) => {
		canLog && console.warn(msg, ...args);
	};

	_debugger.error = (msg, ...args) => {
		console.error(msg, ...args);
	};

	return _debugger;
};
