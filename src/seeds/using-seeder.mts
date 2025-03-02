import { type GetConfigArgs, getConfigOrFail } from '../config/get-config.mjs'
import { usingKysely } from '../kysely/using-kysely.mjs'
import { getSeeder } from './get-seeder.mjs'
import type { Seeder } from './seeder.mjs'

export async function usingSeeder<T>(
	args: GetConfigArgs,
	callback: (seeder: Seeder) => Promise<T>,
): Promise<T> {
	const config = await getConfigOrFail(args)

	const { seeder } = config.seeds

	if (seeder) {
		return await callback(seeder)
	}

	return await usingKysely(config, async (kysely) => {
		const seeder = getSeeder({ ...config, kysely })

		return await callback(seeder)
	})
}
