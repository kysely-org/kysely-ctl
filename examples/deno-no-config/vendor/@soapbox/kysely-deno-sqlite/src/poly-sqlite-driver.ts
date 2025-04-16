import {
	CompiledQuery,
	type DatabaseConnection,
	type Driver,
	type QueryResult,
} from './deps.ts'

import type {
	PolySqlite,
	PolySqliteDialectConfig,
} from './poly-sqlite-dialect-config.ts'

class PolySqliteDriver implements Driver {
	readonly #config: PolySqliteDialectConfig
	readonly #connectionMutex = new ConnectionMutex()

	#connection?: DatabaseConnection

	constructor(config: PolySqliteDialectConfig) {
		this.#config = Object.freeze({ ...config })
	}

	async init(): Promise<void> {
		this.#connection = new PolySqliteConnection(this.#config.database)

		if (this.#config.onCreateConnection) {
			await this.#config.onCreateConnection(this.#connection)
		}
	}

	async acquireConnection(): Promise<DatabaseConnection> {
		// SQLite only has one single connection. We use a mutex here to wait
		// until the single connection has been released.
		await this.#connectionMutex.lock()
		return this.#connection!
	}

	async beginTransaction(connection: DatabaseConnection): Promise<void> {
		await connection.executeQuery(CompiledQuery.raw('begin'))
	}

	async commitTransaction(connection: DatabaseConnection): Promise<void> {
		await connection.executeQuery(CompiledQuery.raw('commit'))
	}

	async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
		await connection.executeQuery(CompiledQuery.raw('rollback'))
	}

	// deno-lint-ignore require-await
	async releaseConnection(): Promise<void> {
		this.#connectionMutex.unlock()
	}

	// deno-lint-ignore require-await
	async destroy(): Promise<void> {
		this.#config.database?.destroy()
	}
}

class PolySqliteConnection implements DatabaseConnection {
	readonly #db: PolySqlite

	constructor(db: PolySqlite) {
		this.#db = db
	}

	executeQuery<R>(query: CompiledQuery): Promise<QueryResult<R>> {
		return this.#db.executeQuery<R>(query)
	}

	streamQuery<R>(query: CompiledQuery): AsyncIterableIterator<QueryResult<R>> {
		if (!this.#db.streamQuery) {
			throw new Error(
				'Streaming queries are not supported by the database driver.',
			)
		}
		return this.#db.streamQuery<R>(query)
	}
}

class ConnectionMutex {
	#promise?: Promise<void>
	#resolve?: () => void

	async lock(): Promise<void> {
		while (this.#promise) {
			await this.#promise
		}

		this.#promise = new Promise((resolve) => {
			this.#resolve = resolve
		})
	}

	unlock(): void {
		const resolve = this.#resolve

		this.#promise = undefined
		this.#resolve = undefined

		resolve?.()
	}
}

export { PolySqliteDriver }
