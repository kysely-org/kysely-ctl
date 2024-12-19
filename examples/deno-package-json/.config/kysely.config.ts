import { defineConfig } from 'kysely-ctl'
import * as postgres from 'postgres'

export default defineConfig({
	dialect: 'postgres',
	dialectConfig: {
		postgres: postgres({
			database: 'kysely_test',
			host: 'localhost',
			port: 5434,
			user: 'kysely',
		}),
	},
})
