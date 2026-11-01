import { type CommandDef, createMain, parseArgs, showUsage } from 'citty'
import { CommonArgs } from './arguments/common.mjs'
import { RootCommand } from './commands/root.mjs'
import { hydrate } from './utils/hydrate.mjs'

export interface CLI {
	parse(argv: string[]): Promise<void>
}

export function buildCLI(): CLI {
	const runCLI = createMain(RootCommand)

	return {
		parse: async (argv: string[]) => {
			const args = parseArgs(argv, CommonArgs)
			if (args.help) {
				return await showHelp(args._)
			}

			await runCLI({ rawArgs: argv })
		},
	}
}

async function showHelp(names: string[]): Promise<void> {
	let command: CommandDef = RootCommand
	let parent: CommandDef | undefined

	for (const name of names) {
		const subCommands = await hydrate(command.subCommands, [])
		const subCommand = await hydrate(subCommands?.[name], [])
		if (!subCommand) {
			break
		}

		parent = command
		command = subCommand
	}

	await showUsage(command, parent)
}
