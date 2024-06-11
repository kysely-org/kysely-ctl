import { createMain } from 'citty'
import { RootCommand } from './commands/root.mjs'

export interface CLI {
	parse(argv: string[]): Promise<void>
}

export function buildCLI(): CLI {
	const runCLI = createMain(RootCommand)

	return {
		parse: async (argv: string[]) => {
			await runCLI({ rawArgs: argv })
		},
	}
}
