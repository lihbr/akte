import { commandsAndFlags } from "./commandsAndFlags";

export const hasFlag = (...flags: string[]): boolean => {
	for (const flag of flags) {
		if (commandsAndFlags().includes(flag)) {
			return true;
		}
	}

	return false;
};

export const hasSilent = (): boolean => hasFlag("--silent", "-s");

export const hasHelp = (): boolean => {
	return (
		hasFlag("--help", "-h") ||
		commandsAndFlags().filter(
			(commandOrFlag) => !["--silent", "-s"].includes(commandOrFlag),
		).length === 0
	);
};

export const hasVersion = (): boolean => hasFlag("--version", "-v");
