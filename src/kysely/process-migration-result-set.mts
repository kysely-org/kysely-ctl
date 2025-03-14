import { consola } from 'consola'
import { colorize } from 'consola/utils'
import type { MigrationResultSet, Migrator } from 'kysely'
import { assertDefined } from '../utils/assert-defined.mjs'
import { exitWithError } from '../utils/error.mjs'
import { getMigrations } from './get-migrations.mjs'

export async function processMigrationResultSet(
	resultSet: MigrationResultSet,
	direction: 'up' | 'down',
	migrator: Migrator,
): Promise<void> {
	consola.debug(resultSet)

	let { error, results } = resultSet

	if (error) {
		const failedMigration = results?.find((result) => result.status === 'Error')

		consola.fail(
			`Migration failed with \`${error}\`${
				failedMigration ? ` @ "${failedMigration.migrationName}"` : ''
			}`,
		)

		exitWithError(error)
	}

	if (!results?.length) {
		return consola.info(
			`Migration skipped: no ${
				direction === 'up' ? 'new' : 'completed'
			} migrations found`,
		)
	}

	consola.success('Migration complete')

	consola.info(
		`${direction === 'up' ? 'Ran' : 'Undone'} ${results.length} migration${
			results.length > 1 ? 's' : ''
		}:`,
	)

	if (direction === 'down') {
		results = [...results].reverse()
	}

	const migrations = await getMigrations(migrator)

	const firstResult = results[0]
	assertDefined(firstResult)

	const { migrationName: firstResultMigrationName } = firstResult

	const untouchedMigrationsBefore = migrations.slice(
		0,
		migrations.findIndex(
			(migration) => migration.name === firstResultMigrationName,
		),
	)

	const lastResult = results.at(-1)
	assertDefined(lastResult)

	const { migrationName: lastResultMigrationName } = lastResult

	const untouchedMigrationsAfter = migrations.slice(
		migrations.findIndex(
			(migration) => migration.name === lastResultMigrationName,
		) + 1,
	)

	for (const migration of untouchedMigrationsBefore) {
		consola.log(`[✓] ${migration.name}`)
	}

	for (const result of results) {
		consola.log(
			`[${colorize('green', result.direction === 'Up' ? '✓' : '⍻')}] ${
				result.migrationName
			}`,
		)
	}

	for (const migration of untouchedMigrationsAfter) {
		consola.log(`[ ] ${migration.name}`)
	}
}
