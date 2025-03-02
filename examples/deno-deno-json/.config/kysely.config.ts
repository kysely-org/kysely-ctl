import { Database } from '@jsr/db__sqlite'
import { DenoSqlite3Dialect } from '@jsr/soapbox__kysely-deno-sqlite'
import { defineConfig } from 'kysely-ctl'

export default defineConfig({
	dialect: new DenoSqlite3Dialect({
		database: new Database('example.db'),
	}),
})
