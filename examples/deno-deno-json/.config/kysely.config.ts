import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'kysely-ctl'
import { DenoSqlite3Dialect } from 'kysely-deno-sqlite'
import { Database } from 'sqlite'

if (Deno.env) {
	// biome-ignore lint/suspicious/noConsole: console.log is fine here
	console.log('Deno env is available')
}

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	dialect: new DenoSqlite3Dialect({
		database: new Database(resolve(__dirname, '../example.db')),
	}),
})
