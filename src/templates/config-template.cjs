const {
	DummyDriver,
	PostgresAdapter,
	PostgresIntrospector,
	PostgresQueryCompiler,
} = require('kysely')
const { defineConfig } = require('kysely-ctl')

exports.default = defineConfig({
	// replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
	dialect: {
		createAdapter() {
			return new PostgresAdapter()
		},
		createDriver() {
			return new DummyDriver()
		},
		createIntrospector(db) {
			return new PostgresIntrospector(db)
		},
		createQueryCompiler() {
			return new PostgresQueryCompiler()
		},
	},
	migrations: {
		allowJS: true,
	},
	//   plugins: [],
	seeds: {
		allowJS: true,
	},
})
