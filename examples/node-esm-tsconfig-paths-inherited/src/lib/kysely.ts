import { DB_PATH } from '@config/db'
import database from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'

// biome-ignore lint/suspicious/noExplicitAny: it's fine.
export default new Kysely<any>({
	dialect: new SqliteDialect({
		database: database(DB_PATH),
	}),
})
