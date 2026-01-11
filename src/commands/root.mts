import { consola, LogLevels } from 'consola'
import { CommonArgs } from '../arguments/common.mjs'
import { getCWD } from '../config/get-cwd.mjs'
import { defineCommand } from '../utils/define-command.mjs'
import { printUpgradeNotice } from '../utils/version.mjs'
import { InitCommand } from './init.mjs'
import { LegacyDownCommand } from './migrate/down.mjs'
import { LegacyLatestCommand } from './migrate/latest.mjs'
import { LegacyListCommand } from './migrate/list.mjs'
import { LegacyMakeCommand as LegacyMigrateMakeCommand } from './migrate/make.mjs'
import { LegacyRollbackCommand } from './migrate/rollback.mjs'
import { MigrateCommand } from './migrate/root.mjs'
import { LegacyUpCommand } from './migrate/up.mjs'
import { LegacyMakeCommand as LegacySeedMakeCommand } from './seed/make.mjs'
import { SeedCommand } from './seed/root.mjs'
import { LegacyRunCommand } from './seed/run.mjs'
import { SqlCommand } from './sql.mjs'

export const RootCommand = defineCommand(CommonArgs, {
	meta: {
		name: 'kysely',
		description: 'A command-line tool for Kysely',
	},
	subCommands: {
		...InitCommand,
		...LegacyDownCommand,
		...LegacyLatestCommand,
		...LegacyListCommand,
		...LegacyMigrateMakeCommand,
		...LegacyRollbackCommand,
		...LegacyRunCommand,
		...LegacySeedMakeCommand,
		...LegacyUpCommand,
		...MigrateCommand,
		...SeedCommand,
		...SqlCommand,
	},
	setup(context) {
		const { args } = context

		if (args.debug) {
			consola.level = LogLevels.debug
		}

		consola.options.formatOptions.date = false

		consola.debug('cwd', getCWD(args as never)) // ensures the CWD is set
	},
	async cleanup(context) {
		try {
			await printUpgradeNotice(context.args as never)
		} catch (error) {
			consola.debug('Failed to print upgrade notice:', error)
		}

		consola.debug(`finished running from "${__filename}"`)
	},
})
