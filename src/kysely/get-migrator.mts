import { Kysely, Migrator } from 'kysely'
import { join } from 'pathe'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'
import { TSFileMigrationProvider } from './ts-file-migration-provider.mjs'

export function getMigrator(
	kysely: Kysely<any>,
	config: ResolvedKyselyCTLConfig,
): Migrator {
	const { migrationFolder, migrator, provider, ...migrations } =
		config.migrations

	return (
		migrator ||
		new Migrator({
			db: kysely,
			...migrations,
			provider:
				provider ||
				new TSFileMigrationProvider({
					migrationFolder: join(config.cwd, migrationFolder),
				}),
		})
	)
}
