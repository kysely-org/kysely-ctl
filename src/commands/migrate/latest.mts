import { consola } from 'consola'
import { CommonArgs } from '../../arguments/common.mjs'
import { MigrateArgs } from '../../arguments/migrate.mjs'
import { processMigrationResultSet } from '../../kysely/process-migration-result-set.mjs'
import { usingMigrator } from '../../kysely/using-migrator.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineArgs } from '../../utils/define-args.mjs'
import { defineCommand } from '../../utils/define-command.mjs'
import { printJSON } from '../../utils/json.mjs'

const args = defineArgs({ ...CommonArgs, ...MigrateArgs })

const Command = defineCommand(args, {
	meta: {
		description: 'Update the database schema to the latest version',
	},
	async run(context) {
		const result = await usingMigrator(context.args, async (migrator) => {
			consola.start('Starting migration to latest')

			const resultSet = await migrator.migrateToLatest()

			return await processMigrationResultSet(
				resultSet,
				'up',
				migrator,
				context.args.json,
			)
		})

		if (context.args.json) {
			printJSON(result)
		}
	},
})

export const LatestCommand = createSubcommand('latest', Command)
export const LegacyLatestCommand = createSubcommand('migrate:latest', Command)
