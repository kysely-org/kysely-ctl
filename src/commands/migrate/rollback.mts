import type { ArgsDef, CommandDef } from 'citty'
import { consola } from 'consola'
import { NO_MIGRATIONS } from 'kysely'
import { CommonArgs } from '../../arguments/common.mjs'
import { processMigrationResultSet } from '../../kysely/process-migration-result-set.mjs'
import { usingMigrator } from '../../kysely/using-migrator.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'

const args = {
	all: {
		description: 'Rollback all completed migrations',
		required: true, // remove this if and when Migrator supports migration batches.
		type: 'boolean',
	},
	...CommonArgs,
} satisfies ArgsDef

const BaseRollbackCommand = {
	meta: {
		name: 'rollback',
		description: 'Rollback all the completed migrations',
	},
	args,
	async run(context) {
		consola.debug(context, [])

		await usingMigrator(context.args, async (migrator) => {
			consola.start('Starting migration rollback')

			const resultSet = await migrator.migrateTo(NO_MIGRATIONS)

			await processMigrationResultSet(resultSet, 'down', migrator)
		})
	},
} satisfies CommandDef<typeof args>

export const RollbackCommand = createSubcommand('rollback', BaseRollbackCommand)
export const LegacyRollbackCommand = createSubcommand(
	'migrate:rollback',
	BaseRollbackCommand,
)
