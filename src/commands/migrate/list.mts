import { consola } from 'consola'
import { CommonArgs } from '../../arguments/common.mjs'
import { getMigrations } from '../../kysely/get-migrations.mjs'
import { usingMigrator } from '../../kysely/using-migrator.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineArgs } from '../../utils/define-args.mjs'
import { defineCommand } from '../../utils/define-command.mjs'
import { exitWithError } from '../../utils/error.mjs'

const args = defineArgs({
	...CommonArgs,
	'fail-on-pending': {
		default: false,
		description: 'Fail if there are pending migrations',
		type: 'boolean',
	},
})

const Command = defineCommand(args, {
	meta: {
		description: 'List both completed and pending migrations',
	},
	async run(context) {
		consola.debug(context, [])

		const migrations = await usingMigrator(context.args, getMigrations)

		consola.debug(migrations)

		if (!migrations.length) {
			return consola.info('No migrations found.')
		}

		consola.info(
			`Found ${migrations.length} migration${migrations.length > 1 ? 's' : ''}:`,
		)

		for (const migration of migrations) {
			consola.log(`[${migration.executedAt ? '`✓`' : ' '}] ${migration.name}`)
		}

		if (!context.args['fail-on-pending']) {
			return
		}

		const hasPending = migrations.some(
			(migration) => migration.executedAt == null,
		)

		if (hasPending) {
			exitWithError('Failed due to pending migrations.')
		}
	},
})

export const ListCommand = createSubcommand('list', Command)
export const LegacyListCommand = createSubcommand('migrate:list', Command)
