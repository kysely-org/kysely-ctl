import type { CompiledQuery, QueryResult } from './deps.ts'
import type {
	PolySqlite,
	PolySqliteDialectConfig,
} from './poly-sqlite-dialect-config.ts'
import { PolySqliteDialect } from './poly-sqlite-dialect.ts'

interface DenoSqlite3Statement {
	[Symbol.iterator](): IterableIterator<any>
}

/** [denodrivers/sqlite3](https://github.com/denodrivers/sqlite3) */
interface DenoSqlite3 {
	close(): void
	changes: number
	lastInsertRowId: number
	prepare(sql: string): {
		all(...params: any): unknown[]
		bind(...params: any): DenoSqlite3Statement
	}
}

interface DenoSqlite3DialectConfig
	extends Omit<PolySqliteDialectConfig, 'database'> {
	database: DenoSqlite3
}

class DenoSqlite3Dialect extends PolySqliteDialect {
	constructor({ database, ...config }: DenoSqlite3DialectConfig) {
		super({
			...config,
			database: DenoSqlite3Adapter(database),
		})
	}
}

function DenoSqlite3Adapter(db: DenoSqlite3): PolySqlite {
	return {
		// deno-lint-ignore require-await
		async executeQuery<R>({
			sql,
			parameters,
		}: CompiledQuery): Promise<QueryResult<R>> {
			const rows = db.prepare(sql).all(...parameters)
			const { changes, lastInsertRowId } = db

			return Promise.resolve({
				rows: rows as R[],
				numAffectedRows: BigInt(changes),
				insertId: BigInt(lastInsertRowId),
			})
		},
		async *streamQuery<R>({
			sql,
			parameters,
		}: CompiledQuery): AsyncIterableIterator<QueryResult<R>> {
			const stmt = db.prepare(sql).bind(parameters)
			for (const row of stmt) {
				yield {
					rows: [row],
				}
			}
		},
		// deno-lint-ignore require-await
		async destroy() {
			db.close()
		},
	}
}

export { DenoSqlite3Dialect, type DenoSqlite3DialectConfig }
