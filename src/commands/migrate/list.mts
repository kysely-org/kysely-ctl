import type { ArgsDef, CommandDef } from 'citty'
import { consola } from 'consola'
import { CommonArgs } from '../../arguments/common.mjs'
import { getMigrations } from '../../kysely/get-migrations.mjs'
import { usingMigrator } from '../../kysely/using-migrator.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'

const args = {
	...CommonArgs,
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
	},
} satisfies CommandDef<typeof args>

export const ListCommand = createSubcommand('list', BaseListCommand)
export const LegacyListCommand = createSubcommand(
	'migrate:list',
	BaseListCommand,
)
