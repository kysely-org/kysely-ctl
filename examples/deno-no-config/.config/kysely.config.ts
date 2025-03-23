import { defineConfig } from 'npm:kysely-ctl@^0.12.1'
import { Database } from 'jsr:@db/sqlite@^0.12.0'
import { DenoSqlite3Dialect } from 'jsr:@soapbox/kysely-deno-sqlite@^2.2.0'

if (Deno.env) {
	// biome-ignore lint/suspicious/noConsole: console.log is fine here
	console.log('Deno env is available')
}

export default defineConfig({
	dialect: new DenoSqlite3Dialect({
		database: new Database('example.db'),
	}),
})
