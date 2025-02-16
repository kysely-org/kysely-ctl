import { type ArgsDef, type CommandDef, showUsage } from 'citty'
import { LogLevels, consola } from 'consola'
import { CommonArgs } from '../arguments/common.mjs'
import { getCWD } from '../config/get-cwd.mjs'
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

const args = {
	...CommonArgs,
	version: {
		alias: 'v',
		default: false,
		description: 'Show version number',
		type: 'boolean',
	},
} satisfies ArgsDef

export const RootCommand = {
	meta: {
		name: 'kysely',
		description: 'A command-line tool for Kysely',
	},
	args,
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

		getCWD(args) // ensures the CWD is set
	},
	async run(context) {
		const { args } = context

		if (!isInSubcommand(context)) {
			consola.debug(context, [])

			if (args.version) {
				return await printInstalledVersions(args)
			}

			await showUsage(context.cmd)
		}

		await printUpgradeNotice(args)

		consola.debug(`finished running from "${__filename}"`)
	},
} satisfies CommandDef<typeof args>
