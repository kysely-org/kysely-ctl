import type { Kysely } from 'kysely'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'
import { getKysely } from './get-kysely.mjs'

export async function usingKysely<T>(
	config: ResolvedKyselyCTLConfig,
	callback: (kysely: Kysely<unknown>) => Promise<T>,
): Promise<T> {
	const kysely = await getKysely(config)

	try {
		return await callback(kysely)
	} finally {
		await kysely.destroy()
	}
}
