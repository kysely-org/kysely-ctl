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
import { printJSON } from '../../utils/json.mjs'

const args = defineArgs({
	...CommonArgs,
	...MigrateArgs,
	...createMigrationNameArg(),
})

const Command = defineCommand(args, {
	meta: {
		description: 'Undo the last/specified migration that was run',
	},
	async run(context) {
		const { args } = context
		const { migration_name } = args

		const result = await usingMigrator(args, async (migrator) => {
			if (await isWrongDirection(migration_name, 'down', migrator)) {
				consola.info(
					`Migration skipped: "${migration_name}" has not been run yet`,
				)
				return { status: 'skipped', migrations: [] }
			}

			consola.start('Starting migration down')

			const resultSet = migration_name
				? await migrator.migrateTo(migration_name)
				: await migrator.migrateDown()

			return await processMigrationResultSet(resultSet, 'down', migrator)
		})

		if (args.json) {
			printJSON(result)
		}
	},
})

export const DownCommand = createSubcommand('down', Command)
export const LegacyDownCommand = createSubcommand('migrate:down', Command)
