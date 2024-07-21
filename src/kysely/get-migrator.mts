import { Migrator } from 'kysely'
import { join } from 'pathe'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'
import { TSFileMigrationProvider } from './ts-file-migration-provider.mjs'

export function getMigrator(config: ResolvedKyselyCTLConfig): Migrator {
	const { kysely, migrations } = config
	const { allowJS, migrationFolder, migrator, provider, ...migratorOptions } =
		migrations

	if (migrator) {
		return migrator
	}

	if (!kysely) {
		throw new Error('kysely instance is required to create a migrator')
	}

	return new Migrator({
		...migratorOptions,
		db: kysely,
		provider:
			provider ||
			new TSFileMigrationProvider({
				allowJS,
				migrationFolder: join(config.cwd, migrationFolder),
			}),
	})
}
