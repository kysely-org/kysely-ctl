import type { MigrationInfo, Migrator } from 'kysely/migration'

let migrations: readonly MigrationInfo[]

export async function getMigrations(
	migrator: Migrator,
): Promise<readonly MigrationInfo[]> {
	return (migrations ||= await migrator.getMigrations())
}
