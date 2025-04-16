import type { CompiledQuery, QueryResult, SqliteDialectConfig } from './deps.ts'

interface PolySqlite {
	executeQuery<R>({ sql, parameters }: CompiledQuery): Promise<QueryResult<R>>
	streamQuery?<R>({
		sql,
		parameters,
	}: CompiledQuery): AsyncIterableIterator<QueryResult<R>>
	destroy(): Promise<void>
}

interface PolySqliteDialectConfig
	extends Omit<SqliteDialectConfig, 'database'> {
	database: PolySqlite
}

export type { PolySqlite, PolySqliteDialectConfig }
