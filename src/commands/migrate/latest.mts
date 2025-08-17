import { consola } from 'consola'
import { CommonArgs } from '../../arguments/common.mjs'
import { MigrateArgs } from '../../arguments/migrate.mjs'
import { processMigrationResultSet } from '../../kysely/process-migration-result-set.mjs'
import { usingMigrator } from '../../kysely/using-migrator.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineArgs } from '../../utils/define-args.mjs'
import { defineCommand } from '../../utils/define-command.mjs'

const args = defineArgs({ ...CommonArgs, ...MigrateArgs })

const Command = defineCommand(args, {
	meta: {
		description: 'Update the database schema to the latest version',
	},
	async run(context) {
		consola.debug(context, [])

		await usingMigrator(context.args, async (migrator) => {
			consola.start('Starting migration to latest')

			const resultSet = await migrator.migrateToLatest()

			await processMigrationResultSet(resultSet, 'up', migrator)
		})
	},
})

export const LatestCommand = createSubcommand('latest', Command)
export const LegacyLatestCommand = createSubcommand('migrate:latest', Command)
