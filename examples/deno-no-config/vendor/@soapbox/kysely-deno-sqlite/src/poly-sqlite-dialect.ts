import {
	type DatabaseIntrospector,
	type Dialect,
	type DialectAdapter,
	type Driver,
	Kysely,
	type QueryCompiler,
	SqliteAdapter,
	SqliteIntrospector,
	SqliteQueryCompiler,
} from './deps.ts'
import { PolySqliteDriver } from './poly-sqlite-driver.ts'

import type { PolySqliteDialectConfig } from './poly-sqlite-dialect-config.ts'

class PolySqliteDialect implements Dialect {
	readonly #config: PolySqliteDialectConfig

	constructor(config: PolySqliteDialectConfig) {
		this.#config = Object.freeze({ ...config })
	}

	createDriver(): Driver {
		return new PolySqliteDriver(this.#config)
	}

	createQueryCompiler(): QueryCompiler {
		return new SqliteQueryCompiler()
	}

	createAdapter(): DialectAdapter {
		return new SqliteAdapter()
	}

	createIntrospector(db: Kysely<any>): DatabaseIntrospector {
		return new SqliteIntrospector(db)
	}
}

export { PolySqliteDialect }
