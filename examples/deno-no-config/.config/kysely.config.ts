import {
	dirname,
	fromFileUrl,
	resolve,
} from 'https://deno.land/std/path/mod.ts'
import { Database } from 'jsr:@db/sqlite@^0.12.0'
import { defineConfig } from 'npm:kysely-ctl@^0.12.2'
// FIXME: dunno how to resolve deno not installing/finding `npm:kysely@^0.27.2` in `deps.ts` of that package so I vendored it partially for now.
import { DenoSqlite3Dialect } from '../vendor/@soapbox/kysely-deno-sqlite/mod.ts'

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
