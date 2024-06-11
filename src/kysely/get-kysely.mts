import { Kysely } from 'kysely'
import { consola } from 'consola'
import { getDialect } from './get-dialect.mjs'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'

export async function getKysely<DB = any>(
	config: ResolvedKyselyCTLConfig,
	debug: boolean = false,
): Promise<Kysely<DB>> {
	const dialect = await getDialect(config)

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
		plugins: config.plugins,
	})
}
