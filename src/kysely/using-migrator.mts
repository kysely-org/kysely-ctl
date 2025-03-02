import type { Migrator } from 'kysely'
import { type GetConfigArgs, getConfigOrFail } from '../config/get-config.mjs'
import { getMigrator } from './get-migrator.mjs'
import { usingKysely } from './using-kysely.mjs'

export async function usingMigrator<T>(
	args: GetConfigArgs,
	callback: (migrator: Migrator) => Promise<T>,
): Promise<T> {
	const config = await getConfigOrFail(args)

	const { migrator } = config.migrations

	if (migrator) {
		return await callback(migrator)
	}

	return await usingKysely(config, async (kysely) => {
		const migrator = getMigrator({ ...config, kysely })

		return await callback(migrator)
	})
}
