import { commandsAndFlags } from "./commandsAndFlags";

export const hasFlag = (...flags: string[]): boolean => {
	for (const flag of flags) {
		if (commandsAndFlags.includes(flag)) {
			return true;
		}
	}

	return false;
};

export const hasSilent = hasFlag("--silent", "-s");
export const hasHelp =
	hasFlag("--help", "-h") ||
	commandsAndFlags.filter(
		(commandOrFlag) => !["--silent", "-s"].includes(commandOrFlag),
	).length === 0;
export const hasVersion = hasFlag("--version", "-v");
