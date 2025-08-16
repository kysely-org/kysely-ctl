import type { ResolvedKyselyCTLConfigWithKyselyInstance } from '../config/kysely-ctl-config.mjs'
import { hydrate } from '../utils/hydrate.mjs'
import { FileSeedProvider } from './file-seed-provider.mjs'
import { Seeder } from './seeder.mjs'

export async function getSeeder(
	config: ResolvedKyselyCTLConfigWithKyselyInstance,
): Promise<Seeder> {
	const { args, kysely, seeds } = config
	const { allowJS, seedFolder, seeder, ...seederOptions } = seeds

	if (seeder) {
		return await hydrate(seeder, [kysely])
	}

	const provider = await hydrate(
		seeds.provider,
		[],
		() =>
			new FileSeedProvider({
				allowJS,
				debug: args.debug,
				filesystemCaching: args['filesystem-caching'],
				experimentalResolveTSConfigPaths:
					args['experimental-resolve-tsconfig-paths'],
				seedFolder,
			}),
	)

	return new Seeder({ ...seederOptions, db: kysely, provider })
}
