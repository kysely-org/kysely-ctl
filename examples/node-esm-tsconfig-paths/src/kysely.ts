import database from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'

import { DB_PATH } from '@config/db'

export default new Kysely({
	dialect: new SqliteDialect({
		database: database(DB_PATH),
	}),
})
