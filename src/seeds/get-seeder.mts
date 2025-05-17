import { join } from 'pathe'
import type { SetRequired } from 'type-fest'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'
import { FileSeedProvider } from './file-seed-provider.mjs'
import { Seeder } from './seeder.mjs'

export async function getSeeder(
	config: SetRequired<ResolvedKyselyCTLConfig, 'kysely'>,
): Promise<Seeder> {
	const { args, kysely, seeds } = config
	const { allowJS, seedFolder, seeder, provider, ...seederOptions } = seeds

	if (seeder) {
		return await seeder(kysely)
	}

	return new Seeder({
		...seederOptions,
		db: kysely,
		provider:
			provider ||
			new FileSeedProvider({
				allowJS,
				debug: args.debug,
				filesystemCaching: args['filesystem-caching'],
				experimentalResolveTSConfigPaths:
					args['experimental-resolve-tsconfig-paths'],
				seedFolder: join(config.cwd, seedFolder),
			}),
	})
}
