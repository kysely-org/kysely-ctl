import { showUsage } from 'citty'
import { consola } from 'consola'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import type { StrictCommandDef } from '../../utils/define-command.mjs'
import { isInSubcommand } from '../../utils/is-in-subcommand.mjs'
import { RootCommand } from '../root.mjs'
import { ListCommand } from './list.mjs'
import { MakeCommand } from './make.mjs'
import { RunCommand } from './run.mjs'

const subCommands = {
	...ListCommand,
	...MakeCommand,
	...RunCommand,
	// biome-ignore lint/suspicious/noExplicitAny: it's fine
} satisfies StrictCommandDef<any>['subCommands']

export const SeedCommand = createSubcommand('seed', {
	args: {},
	meta: {
		description: `\`${Object.keys(subCommands).sort().join('|')}\``,
	},
	async run(context) {
		if (!isInSubcommand(context)) {
			consola.debug(context, [])

			await showUsage(context.cmd, RootCommand)
		}
	},
	subCommands,
})
