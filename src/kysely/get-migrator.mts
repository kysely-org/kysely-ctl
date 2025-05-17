import { Migrator } from 'kysely'
import { join } from 'pathe'
import type { SetRequired } from 'type-fest'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'
import { TSFileMigrationProvider } from './ts-file-migration-provider.mjs'

export async function getMigrator(
	config: SetRequired<ResolvedKyselyCTLConfig, 'kysely'>,
): Promise<Migrator> {
	const { args, kysely, migrations } = config
	const { allowJS, migrationFolder, migrator, provider, ...migratorOptions } =
		migrations

	if (migrator) {
		return await migrator(kysely)
	}

	return new Migrator({
		...migratorOptions,
		db: kysely,
		provider:
			provider ||
			new TSFileMigrationProvider({
				allowJS,
				debug: args.debug,
				experimentalResolveTSConfigPaths:
					args['experimental-resolve-tsconfig-paths'],
				filesystemCaching: args['filesystem-caching'],
				migrationFolder: join(config.cwd, migrationFolder),
			}),
	})
}
