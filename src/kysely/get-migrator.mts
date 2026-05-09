import type { Migrator } from 'kysely/migration'
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
				filesystemCaching: args['filesystem-caching'],
				migrationFolder,
			}),
	)

	const { Migrator } = await import('kysely/migration').catch(
		() => import('kysely') as never as typeof import('kysely/migration'),
	)

	return new Migrator({ ...migratorOptions, db: kysely, provider })
}
