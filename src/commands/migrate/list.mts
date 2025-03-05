import type { ArgsDef, CommandDef } from 'citty'
import { consola } from 'consola'
import { CommonArgs } from '../../arguments/common.mjs'
import { getMigrations } from '../../kysely/get-migrations.mjs'
import { usingMigrator } from '../../kysely/using-migrator.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'

const args = {
	...CommonArgs,
	'fail-on-pending': {
		type: 'boolean',
		default: false,
		required: false
	}
} satisfies ArgsDef

const BaseListCommand = {
	meta: {
		name: 'list',
		description: 'List both completed and pending migrations',
	},
	args,
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

		const hasPending = migrations.some(migration => migration.executedAt === undefined);

		if (context.args['fail-on-pending'] && hasPending) {
			throw new Error('Failed due to pending migrations.');
		}
	},
} satisfies CommandDef<typeof args>

export const ListCommand = createSubcommand('list', BaseListCommand)
export const LegacyListCommand = createSubcommand(
	'migrate:list',
	BaseListCommand,
)
