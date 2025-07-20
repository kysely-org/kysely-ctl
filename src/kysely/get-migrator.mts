import { Migrator } from 'kysely'
import { join } from 'pathe'
import type { ResolvedKyselyCTLConfigWithKyselyInstance } from '../config/kysely-ctl-config.mjs'
import { hydrate } from '../utils/hydrate.mjs'
import { TSFileMigrationProvider } from './ts-file-migration-provider.mjs'

export async function getMigrator(
	config: ResolvedKyselyCTLConfigWithKyselyInstance,
): Promise<Migrator> {
	const { args, kysely, migrations } = config
	const { allowJS, migrationFolder, migrator, ...migratorOptions } = migrations

	if (migrator) {
		return await hydrate(migrator, [kysely])
	}

	const provider = await hydrate(
		migrations.provider,
		[],
		() =>
			new TSFileMigrationProvider({
				allowJS,
				debug: args.debug,
				experimentalResolveTSConfigPaths:
					args['experimental-resolve-tsconfig-paths'],
				filesystemCaching: args['filesystem-caching'],
				migrationFolder: join(config.cwd, migrationFolder),
			}),
	)

	return new Migrator({ ...migratorOptions, db: kysely, provider })
}
