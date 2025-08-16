import {
	dirname,
	fromFileUrl,
	resolve,
} from 'https://deno.land/std/path/mod.ts'
import { Database } from '@jsr/db__sqlite'
import { DenoSqlite3Dialect } from '@jsr/soapbox__kysely-deno-sqlite'
import { defineConfig } from 'kysely-ctl'

if (Deno.env) {
	// biome-ignore lint/suspicious/noConsole: console.log is fine here
	console.log('Deno env is available')
}

const __dirname = dirname(fromFileUrl(import.meta.url))

export default defineConfig({
	dialect: new DenoSqlite3Dialect({
		database: new Database(resolve(__dirname, '../example.db')),
	}),
})
