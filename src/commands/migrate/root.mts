import { showUsage } from 'citty'
import { consola } from 'consola'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { isInSubcommand } from '../../utils/is-in-subcommand.mjs'
import { RootCommand } from '../root.mjs'
import { DownCommand } from './down.mjs'
import { LatestCommand } from './latest.mjs'
import { ListCommand } from './list.mjs'
import { MakeCommand } from './make.mjs'
import { RollbackCommand } from './rollback.mjs'
import { UpCommand } from './up.mjs'

export const MigrateCommand = createSubcommand('migrate', {
	args: {},
	meta: {
		description: 'Migrate the database schema',
	},
	subCommands: {
		...DownCommand,
		...LatestCommand,
		...ListCommand,
		...MakeCommand,
		...RollbackCommand,
		...UpCommand,
	},
	async run(context) {
		if (!isInSubcommand(context)) {
			consola.debug(context, [])

			await showUsage(context.cmd, RootCommand)
		}
	},
})
