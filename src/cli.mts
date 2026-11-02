import { createMain, runCommand } from 'citty'
import { process } from 'std-env'
import { RootCommand } from './commands/root.mjs'
import { isJSONOutput, printJSON, serializeError } from './utils/output.mjs'

export interface CLI {
	parse(argv: string[]): Promise<void>
}

export function buildCLI(): CLI {
	const runCLI = createMain(RootCommand)

	return {
		parse: async (argv: string[]) => {
			if (!isJSONOutput(argv)) {
				return await runCLI({ rawArgs: argv })
			}

			try {
				await runCommand(RootCommand, { rawArgs: argv })
			} catch (error) {
				process.exitCode = 1
				printJSON({ status: 'error', error: serializeError(error) })
			}
		},
	}
}
