import { MigrationInfo, Migrator } from 'kysely'

let migrations: readonly MigrationInfo[]

export async function getMigrations(
	migrator: Migrator,
): Promise<readonly MigrationInfo[]> {
	return (migrations ||= await migrator.getMigrations())
}
