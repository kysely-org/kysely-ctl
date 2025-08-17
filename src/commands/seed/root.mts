import { showUsage } from 'citty'
import { consola } from 'consola'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { isInSubcommand } from '../../utils/is-in-subcommand.mjs'
import { RootCommand } from '../root.mjs'
import { ListCommand } from './list.mjs'
import { MakeCommand } from './make.mjs'
import { RunCommand } from './run.mjs'

export const SeedCommand = createSubcommand('seed', {
	args: {},
	meta: {
		description:
			'Populate your database with test or seed data independent of your migration files',
	},
	subCommands: {
		...ListCommand,
		...MakeCommand,
		...RunCommand,
	},
	async run(context) {
		if (!isInSubcommand(context)) {
			consola.debug(context, [])

			await showUsage(context.cmd, RootCommand)
		}
	},
})
