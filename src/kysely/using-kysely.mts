import type { Kysely } from 'kysely'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'
import { getKysely } from './get-kysely.mjs'

export async function usingKysely<T>(
	config: ResolvedKyselyCTLConfig,
	// biome-ignore lint/suspicious/noExplicitAny: `any` is required here, for now.
	callback: (kysely: Kysely<any>) => Promise<T>,
): Promise<T> {
	const kysely = await getKysely(config)

	try {
		return await callback(kysely)
	} finally {
		if (config.destroyOnExit !== false || typeof config.dialect === 'string') {
			await kysely.destroy()
		}
	}
}
