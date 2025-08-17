import { showUsage } from 'citty'
import { consola, LogLevels } from 'consola'
import { getCWD } from '../config/get-cwd.mjs'
import { defineArgs } from '../utils/define-args.mjs'
import { defineCommand } from '../utils/define-command.mjs'
import { isInSubcommand } from '../utils/is-in-subcommand.mjs'
import {
	printInstalledVersions,
	printUpgradeNotice,
} from '../utils/version.mjs'
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

const args = defineArgs({
	help: {
		alias: 'h',
		default: false,
		description: 'Show help information',
		type: 'boolean',
	},
	version: {
		alias: 'v',
		default: false,
		description: 'Show version number',
		type: 'boolean',
	},
})

export const RootCommand = defineCommand(args, {
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
	async run(context) {
		const { args } = context

		if (!isInSubcommand(context)) {
			consola.debug(context, [])

			if (args.version) {
				return await printInstalledVersions(args as never)
			}

			await showUsage(context.cmd)
		}

		try {
			await printUpgradeNotice(args as never)
		} catch (error) {
			consola.debug('Failed to print upgrade notice:', error)
		}

		consola.debug(`finished running from "${__filename}"`)
	},
})
