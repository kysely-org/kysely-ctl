import {
	type Dialect,
	type MssqlDialectConfig,
	MysqlDialect,
	type MysqlDialectConfig,
	type PGliteDialectConfig,
	PostgresDialect,
	type PostgresDialectConfig,
	SqliteDialect,
	type SqliteDialectConfig,
} from 'kysely'
import type { NeonDialectConfig } from 'kysely-neon'
import type { PostgresJSDialectConfig } from 'kysely-postgres-js'
import type { PPGDialectConfig } from 'kysely-prisma-postgres'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'
import { hydrate } from '../utils/hydrate.mjs'

export async function getDialect(
	config: ResolvedKyselyCTLConfig,
): Promise<Dialect> {
	const { dialect } = config

	if (!dialect) {
		throw new Error('No dialect provided')
	}

	if (typeof dialect !== 'string') {
		return await hydrate(dialect, [])
	}

	const dialectConfig = await hydrate(config.dialectConfig, [])

	if (dialect === 'pg') {
		return new PostgresDialect(dialectConfig as PostgresDialectConfig)
	}

	if (dialect === 'mysql2') {
		return new MysqlDialect(dialectConfig as MysqlDialectConfig)
	}

	if (dialect === 'tedious') {
		// since it was introduced only in kysely v0.27.0
		// and we want to support older versions too
		return new (await import('kysely')).MssqlDialect(
			dialectConfig as MssqlDialectConfig,
		)
	}

	if (dialect === 'better-sqlite3') {
		return new SqliteDialect(dialectConfig as SqliteDialectConfig)
	}

	if (dialect === 'pglite') {
		// since it was introduced only in kysely v0.29.0
		// and we want to support older versions too
		return new (await import('kysely')).PGliteDialect(
			dialectConfig as PGliteDialectConfig,
		)
	}

	if (dialect === 'postgres' || dialect === 'bun') {
		return new (await import('kysely-postgres-js')).PostgresJSDialect(
			dialectConfig as PostgresJSDialectConfig,
		)
	}

	if (dialect === '@neondatabase/serverless') {
		return new (await import('kysely-neon')).NeonDialect(
			dialectConfig as NeonDialectConfig,
		)
	}

	if (dialect === '@prisma/ppg') {
		return new (await import('kysely-prisma-postgres')).PPGDialect(
			dialectConfig as PPGDialectConfig,
		)
	}

	dialect satisfies never

	throw new Error(`Unknown dialect: "${dialect}"`)
}
