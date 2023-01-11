import { type AkteApp } from "./AkteApp";

import { commandsAndFlags } from "./lib/commandsAndFlags";
import { createDebugger } from "./lib/createDebugger";
import { hasHelp, hasVersion } from "./lib/hasFlag";
import { pkg } from "./lib/pkg";

const debugCLI = createDebugger("akte:cli");

const exit = (code: number): void => {
	debugCLI("done");

	process.exit(code);
};

const displayHelp = (): void => {
	debugCLI.log(`
  Akte CLI

  DOCUMENTATION
    https://akte.lihbr.com

  VERSION
    ${pkg.name}@${pkg.version}

  USAGE
    $ node akte.config.js <command>
    $ npx tsx akte.config.ts <command>

  COMMANDS
    build          Build Akte to file system

  OPTIONS
    --silent, -s   Silence output

    --help, -h     Display CLI help
    --version, -v  Display CLI version
`);

	exit(0);
};

const displayVersion = (): void => {
	debugCLI.log(`${pkg.name}@${pkg.version}`);

	exit(0);
};

const build = async (app: AkteApp): Promise<void> => {
	debugCLI.log("\nAkte → Beginning build...\n");

	await app.buildAll();

	const buildTime = `${Math.ceil(performance.now())}ms`;
	debugCLI.log("\nAkte → Done in %o", buildTime);

	return exit(0);
};

export const runCLI = async (app: AkteApp): Promise<void> => {
	debugCLI("started");

	process.title = "Akte CLI";

	// Global flags
	if (hasHelp()) {
		debugCLI("displaying help");

		return displayHelp();
	} else if (hasVersion()) {
		debugCLI("displaying version");

		return displayVersion();
	}

	// Commands
	const [command] = commandsAndFlags();
	switch (command) {
		case "build":
			debugCLI("running %o command", command);

			return build(app);

		default:
			debugCLI.log(
				`Akte → Unknown command \`${command}\`, use \`--help\` flag for manual`,
			);

			exit(2);
	}
};
