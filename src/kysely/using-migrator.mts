import type { Migrator } from 'kysely'
import { type ArgsLike, getConfigOrFail } from '../config/get-config.mjs'
import { usingKysely } from './using-kysely.mjs'
import { getMigrator } from './get-migrator.mjs'

export async function usingMigrator<T>(
	args: ArgsLike,
	callback: (migrator: Migrator) => Promise<T>,
): Promise<T> {
	const config = await getConfigOrFail(args)

	return await usingKysely(config, async (kysely) => {
		const migrator = getMigrator(kysely, config)

		return await callback(migrator)
	})
}
