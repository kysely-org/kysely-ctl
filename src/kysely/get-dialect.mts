import {
	type Dialect,
	MysqlDialect,
	PostgresDialect,
	SqliteDialect,
} from 'kysely'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'

export async function getDialect(
	config: ResolvedKyselyCTLConfig,
): Promise<Dialect> {
	const { dialect, dialectConfig } = config

	if (!dialect) {
		throw new Error('No dialect provided')
	}

	if (typeof dialect === 'object') {
		return dialect
	}

	if (dialect === 'pg') {
		return new PostgresDialect(dialectConfig)
	}

	if (dialect === 'mysql2') {
		return new MysqlDialect(dialectConfig)
	}

	if (dialect === 'tedious') {
		// since it was introduced only in kysely v0.27.0
		// and we want to support older versions too
		return new (await import('kysely')).MssqlDialect(dialectConfig)
	}

	if (dialect === 'better-sqlite3') {
		return new SqliteDialect(dialectConfig)
	}

	if (dialect === 'postgres') {
		return new (await import('kysely-postgres-js')).PostgresJSDialect(
			dialectConfig,
		)
	}

	throw new Error(`Unknown dialect: ${dialect}`)
}
