import type { ArgsDef, CommandDef } from 'citty'
import { consola } from 'consola'
import { CommonArgs } from '../../arguments/common.mjs'
import { MigrateArgs } from '../../arguments/migrate.mjs'
import { createMigrationNameArg } from '../../arguments/migration-name.mjs'
import { isWrongDirection } from '../../kysely/is-wrong-direction.mjs'
import { processMigrationResultSet } from '../../kysely/process-migration-result-set.mjs'
import { usingMigrator } from '../../kysely/using-migrator.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'

const args = {
	...CommonArgs,
	...MigrateArgs,
	...createMigrationNameArg(),
} satisfies ArgsDef

const BaseDownCommand = {
	meta: {
		name: 'down',
		description: 'Undo the last/specified migration that was run',
	},
	args,
	async run(context) {
		const { args } = context
		const { migration_name } = context.args

		consola.debug(context, [])

		await usingMigrator(args, async (migrator) => {
			if (await isWrongDirection(migration_name, 'down', migrator)) {
				return consola.info(
					`Migration skipped: "${migration_name}" has not been run yet`,
				)
			}

			consola.start('Starting migration down')

			const resultSet = migration_name
				? await migrator.migrateTo(migration_name)
				: await migrator.migrateDown()

			await processMigrationResultSet(resultSet, 'down', migrator)
		})
	},
} satisfies CommandDef<typeof args>

export const DownCommand = createSubcommand('down', BaseDownCommand)
export const LegacyDownCommand = createSubcommand(
	'migrate:down',
	BaseDownCommand,
)
