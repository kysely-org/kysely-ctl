import { join } from 'pathe'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'
import { FileSeedProvider } from './file-seed-provider.mjs'
import { Seeder } from './seeder.mjs'

export function getSeeder(config: ResolvedKyselyCTLConfig): Seeder {
	const { args, kysely, seeds } = config
	const { allowJS, seedFolder, seeder, provider, ...seederOptions } = seeds

	if (seeder) {
		return seeder
	}

	if (!kysely) {
		throw new Error('Kysely instance is required to create a Seeder')
	}

	return (
		seeder ||
		new Seeder({
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
	)
}
