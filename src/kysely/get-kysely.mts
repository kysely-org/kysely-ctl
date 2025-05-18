import { consola } from 'consola'
import { Kysely } from 'kysely'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'
import { hydrate } from '../utils/hydrate.mjs'
import { getDialect } from './get-dialect.mjs'

// biome-ignore lint/suspicious/noExplicitAny: `any` is required here, for now.
export async function getKysely<DB = any>(
	config: ResolvedKyselyCTLConfig,
	debug = false,
): Promise<Kysely<DB>> {
	const { kysely } = config

	if (kysely) {
		return await hydrate(kysely, [])
	}

	const [dialect, plugins] = await Promise.all([
		getDialect(config),
		hydrate(config.plugins, []),
	])

	return new Kysely<DB>({
		dialect,
		log: debug
			? (event) => {
					if (event.level === 'error') {
						return consola.error(event.error)
					}

					return consola.log(
						`executed \`${event.query.sql}\` in ${event.queryDurationMillis}ms`,
					)
				}
			: [],
		plugins,
	})
}
