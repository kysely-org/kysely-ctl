import { Database } from '@jsr/db__sqlite'
import { DenoSqlite3Dialect } from '@jsr/soapbox__kysely-deno-sqlite'
import { defineConfig } from 'kysely-ctl'

if (Deno.env) {
	console.log('Deno env is available')
}

export default defineConfig({
	dialect: new DenoSqlite3Dialect({
		database: new Database('example.db'),
	}),
})
