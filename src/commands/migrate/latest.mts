import type { ArgsDef, CommandDef } from 'citty'
import { consola } from 'consola'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { CommonArgs } from '../../arguments/common.mjs'
import { processMigrationResultSet } from '../../kysely/process-migration-result-set.mjs'
import { usingMigrator } from '../../kysely/using-migrator.mjs'

const args = {
	...CommonArgs,
} satisfies ArgsDef

const BaseLatestCommand = {
	meta: {
		name: 'latest',
		description: 'Update the database schema to the latest version',
	},
	args,
	async run(context) {
		consola.debug(context, [])

		await usingMigrator(context.args, async (migrator) => {
			consola.start('Starting migration to latest')

			const resultSet = await migrator.migrateToLatest()

			await processMigrationResultSet(resultSet, 'up', migrator)
		})
	},
} satisfies CommandDef<typeof args>

export const LatestCommand = createSubcommand('latest', BaseLatestCommand)
export const LegacyLatestCommand = createSubcommand(
	'migrate:latest',
	BaseLatestCommand,
)
