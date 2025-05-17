import { type GetConfigArgs, getConfigOrFail } from '../config/get-config.mjs'
import { usingKysely } from '../kysely/using-kysely.mjs'
import { getSeeder } from './get-seeder.mjs'
import type { Seeder } from './seeder.mjs'

export async function usingSeeder<T>(
	args: GetConfigArgs,
	callback: (seeder: Seeder) => Promise<T>,
): Promise<T> {
	const config = await getConfigOrFail(args)

	return await usingKysely(config, async (kysely) => {
		const seeder = await getSeeder({ ...config, kysely })

		return await callback(seeder)
	})
}
