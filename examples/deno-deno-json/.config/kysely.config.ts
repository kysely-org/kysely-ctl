import { Database } from '@db/sqlite'
import { DenoSqlite3Dialect } from '@soapbox/kysely-deno-sqlite'
import { defineConfig } from 'kysely-ctl'

export default defineConfig({
	dialect: new DenoSqlite3Dialect({
		database: new Database('example.db'),
	}),
})
