import { consola } from 'consola'
import { NO_MIGRATIONS } from 'kysely'
import { CommonArgs } from '../../arguments/common.mjs'
import { MigrateArgs } from '../../arguments/migrate.mjs'
import { processMigrationResultSet } from '../../kysely/process-migration-result-set.mjs'
import { usingMigrator } from '../../kysely/using-migrator.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineArgs } from '../../utils/define-args.mjs'
import { defineCommand } from '../../utils/define-command.mjs'

const args = defineArgs({
	...CommonArgs,
	...MigrateArgs,
	all: {
		description: 'Rollback all completed migrations',
		required: true, // remove this if and when Migrator supports migration batches.
		type: 'boolean',
	},
})

const Command = defineCommand(args, {
	meta: {
		description: 'Rollback all the completed migrations',
	},
	async run(context) {
		await usingMigrator(context.args, async (migrator) => {
			consola.start('Starting migration rollback')

			const resultSet = await migrator.migrateTo(NO_MIGRATIONS)

			await processMigrationResultSet(resultSet, 'down', migrator)
		})
	},
})

export const RollbackCommand = createSubcommand('rollback', Command)
export const LegacyRollbackCommand = createSubcommand(
	'migrate:rollback',
	Command,
)
