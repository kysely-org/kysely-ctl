import { showUsage } from 'citty'
import { consola } from 'consola'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import type { StrictCommandDef } from '../../utils/define-command.mjs'
import { isInSubcommand } from '../../utils/is-in-subcommand.mjs'
import { RootCommand } from '../root.mjs'
import { DownCommand } from './down.mjs'
import { LatestCommand } from './latest.mjs'
import { ListCommand } from './list.mjs'
import { MakeCommand } from './make.mjs'
import { RollbackCommand } from './rollback.mjs'
import { UpCommand } from './up.mjs'

const subCommands = {
	...DownCommand,
	...LatestCommand,
	...ListCommand,
	...MakeCommand,
	...RollbackCommand,
	...UpCommand,
	// biome-ignore lint/suspicious/noExplicitAny: it's fine
} satisfies StrictCommandDef<any>['subCommands']

export const MigrateCommand = createSubcommand('migrate', {
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
