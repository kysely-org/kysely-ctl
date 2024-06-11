import { type CommandDef, showUsage, type ArgsDef } from 'citty'
import { consola, LogLevels } from 'consola'
import {
	printInstalledVersions,
	printUpgradeNotice,
} from '../utils/version.mjs'
import { MigrateCommand } from './migrate/root.mjs'
import { isInSubcommand } from '../utils/is-in-subcommand.mjs'
import { LegacyMakeCommand as LegacyMigrateMakeCommand } from './migrate/make.mjs'
import { LegacyListCommand } from './migrate/list.mjs'
import { LegacyLatestCommand } from './migrate/latest.mjs'
import { LegacyRollbackCommand } from './migrate/rollback.mjs'
import { LegacyDownCommand } from './migrate/down.mjs'
import { LegacyUpCommand } from './migrate/up.mjs'
import { CommonArgs } from '../arguments/common.mjs'
import { InitCommand } from './init.mjs'
import { SeedCommand } from './seed/root.mjs'
import { LegacyMakeCommand as LegacySeedMakeCommand } from './seed/make.mjs'
import { LegacyRunCommand } from './seed/run.mjs'
import { getCWD } from '../config/get-cwd.mjs'

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
	},
	setup(context) {
		if (context.args.debug) {
			consola.level = LogLevels.debug
		}

		consola.options.formatOptions.date = false

		getCWD(context.args) // ensures the CWD is set
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
