import { consola } from 'consola'
import { CommonArgs } from '../../arguments/common.mjs'
import { MigrateArgs } from '../../arguments/migrate.mjs'
import { createMigrationNameArg } from '../../arguments/migration-name.mjs'
import { isWrongDirection } from '../../kysely/is-wrong-direction.mjs'
import { processMigrationResultSet } from '../../kysely/process-migration-result-set.mjs'
import { usingMigrator } from '../../kysely/using-migrator.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineArgs } from '../../utils/define-args.mjs'
import { defineCommand } from '../../utils/define-command.mjs'

const args = defineArgs({
	...CommonArgs,
	...MigrateArgs,
	...createMigrationNameArg(),
})

const Command = defineCommand(args, {
	meta: {
		description: 'Run the next migration that has not yet been run',
	},
	async run(context) {
		const { args } = context
		const { migration_name } = args

		await usingMigrator(args, async (migrator) => {
			if (await isWrongDirection(migration_name, 'up', migrator)) {
				return consola.info(
					`Migration skipped: migration "${migration_name}" has already been run`,
				)
			}

			consola.start('Starting migration up')

			const resultSet = migration_name
				? await migrator.migrateTo(migration_name)
				: await migrator.migrateUp()

			await processMigrationResultSet(resultSet, 'up', migrator)
		})
	},
})

export const UpCommand = createSubcommand('up', Command)
export const LegacyUpCommand = createSubcommand('migrate:up', Command)
