import database from 'better-sqlite3'
import {
	CamelCasePlugin,
	type Dialect,
	DummyDriver,
	Kysely,
	Migrator,
	PostgresAdapter,
	PostgresIntrospector,
	PostgresQueryCompiler,
	type SqliteDialectConfig,
} from 'kysely'
import { describe, it } from 'vitest'
import {
	FileSeedProvider,
	Seeder,
	TSFileMigrationProvider,
	defineConfig,
} from '../dist/index.js'

describe('defineConfig', () => {
	const {
		dialect,
		plugins,
		kysely,
		dialectConfig,
		migrationProvider,
		migrator,
		seedProvider,
		seeder,
	} = init()

	describe('when passing migrator & seeder instances', () => {
		it('should not type-error', () => {
			defineConfig({
				migrations: { migrator },
				seeds: { seeder },
			})
		})

		it('should type-error when also passing a Kysely instance', () => {
			// @ts-expect-error
			defineConfig({
				kysely,
				migrations: { migrator },
				seeds: { seeder },
			})
		})

		it('should type-error when also passing a dialect instance', () => {
			// @ts-expect-error
			defineConfig({
				dialect,
				migrations: { migrator },
				seeds: { seeder },
			})
		})

		it('should type-error when also passing a dialect name', () => {
			// @ts-expect-error
			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig,
				migrations: { migrator },
				seeds: { seeder },
			})
		})

		it('should type-error when also passing plugins', () => {
			// @ts-expect-error
			defineConfig({
				migrations: { migrator },
				plugins,
				seeds: { seeder },
			})
		})
	})

	describe('when passing a migrator instance', () => {
		describe('when passing a seed provider', () => {
			it('should type-error when not passing kysely/dialect instance or related', () => {
				// @ts-expect-error
				defineConfig({
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})
			})

			it('should not type-error when also passing a kysely instance', () => {
				defineConfig({
					kysely,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})
			})

			it('should not type-error when also passing a dialect instance', () => {
				defineConfig({
					dialect,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})
			})

			it('should not type-error when also passing a dialect name & config', () => {
				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})
			})
		})

		describe('when passing seed folder', () => {
			it('should type-error when not passing kysely/dialect instance or related', () => {
				// @ts-expect-error
				defineConfig({
					migrations: { migrator },
					seeds: { seedFolder: 'seeds' },
				})
			})

			it('should not type-error when also passing a kysely instance', () => {
				defineConfig({
					kysely,
					migrations: { migrator },
					seeds: { seedFolder: 'seeds' },
				})
			})

			it('should not type-error when also passing a dialect instance', () => {
				defineConfig({
					dialect,
					migrations: { migrator },
					seeds: { seedFolder: 'seeds' },
				})
			})

			it('should not type-error when also passing a dialect name & config', () => {
				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig,
					migrations: { migrator },
					seeds: { seedFolder: 'seeds' },
				})
			})
		})

		it('should type-error when also passing a migration provider', () => {
			defineConfig({
				kysely,
				migrations: {
					migrator,
					// @ts-expect-error
					provider: migrationProvider,
				},
			})

			defineConfig({
				kysely,
				migrations: {
					provider: migrationProvider,
					// @ts-expect-error
					migrator,
				},
			})
		})

		it('should type-error when also passing migration folder', () => {
			defineConfig({
				kysely,
				migrations: {
					migrator,
					// @ts-expect-error
					migrationFolder: 'migrations',
				},
			})

			defineConfig({
				kysely,
				migrations: {
					migrationFolder: 'migrations',
					// @ts-expect-error
					migrator,
				},
			})
		})
	})

	describe('when passing a seeder instance', () => {
		describe('when passing a migration provider', () => {
			it('should type-error when not passing kysely/dialect instance or related', () => {
				// @ts-expect-error
				defineConfig({
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})
			})

			it('should not type-error when also passing a kysely instance', () => {
				defineConfig({
					kysely,
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})
			})

			it('should not type-error when also passing a dialect instance', () => {
				defineConfig({
					dialect,
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})
			})

			it('should not type-error when also passing a dialect name & config', () => {
				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig,
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})
			})
		})

		describe('when passing migration folder', () => {
			it('should type-error when not passing kysely/dialect instance or related', () => {
				// @ts-expect-error
				defineConfig({
					migrations: { migrationFolder: 'migrations' },
					seeds: { seeder },
				})
			})

			it('should not type-error when also passing a kysely instance', () => {
				defineConfig({
					kysely,
					migrations: { migrationFolder: 'migrations' },
					seeds: { seeder },
				})
			})

			it('should not type-error when also passing a dialect instance', () => {
				defineConfig({
					dialect,
					migrations: { migrationFolder: 'migrations' },
					seeds: { seeder },
				})
			})

			it('should not type-error when also passing a dialect name & config', () => {
				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig,
					migrations: { migrationFolder: 'migrations' },
					seeds: { seeder },
				})
			})
		})

		it('should type-error when also passing a seed provider', () => {
			defineConfig({
				kysely,
				seeds: {
					seeder,
					// @ts-expect-error
					provider: seedProvider,
				},
			})

			defineConfig({
				kysely,
				seeds: {
					provider: seedProvider,
					// @ts-expect-error
					seeder,
				},
			})
		})

		it('should type-error when also passing seed folder', () => {
			defineConfig({
				kysely,
				seeds: {
					seeder,
					// @ts-expect-error
					seedFolder: 'seeds',
				},
			})

			defineConfig({
				kysely,
				seeds: {
					seedFolder: 'seeds',
					// @ts-expect-error
					seeder,
				},
			})
		})
	})

	describe('when passing a Kysely instance', () => {
		it('should not type-error', () => {
			defineConfig({
				kysely,
			})
		})

		it('should type-error when also passing a dialect instance', () => {
			defineConfig({
				kysely,
				// @ts-expect-error
				dialect,
			})
		})

		it('should type-error when also passing a dialect name + config', () => {
			defineConfig({
				kysely,
				// @ts-expect-error
				dialect: 'better-sqlite3',
				dialectConfig,
			})

			defineConfig({
				kysely,
				// @ts-expect-error
				dialectConfig,
				dialect: 'better-sqlite3',
			})
		})

		it('should type-error when also passing plugins', () => {
			defineConfig({
				kysely,
				// @ts-expect-error
				plugins,
			})

			defineConfig({
				plugins,
				// @ts-expect-error
				kysely,
			})
		})
	})

	describe('when passing a dialect instance', () => {
		it('should not type-error', () => {
			defineConfig({
				dialect,
			})
		})

		it('should type-error when also passing a dialect config', () => {
			defineConfig({
				dialect,
				// @ts-expect-error
				dialectConfig,
			})

			defineConfig({
				// @ts-expect-error
				dialectConfig,
				dialect,
			})
		})

		it('should type-error when also passing a kysely instance', () => {
			defineConfig({
				dialect,
				// @ts-expect-error
				kysely,
			})
		})
	})

	describe('when passing a dialect name + config', () => {
		it('should not type-error', () => {
			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig,
			})
		})

		it('should type-error when not passing a dialect config', () => {
			// @ts-expect-error
			defineConfig({
				dialect: 'better-sqlite3',
			})
		})

		it('should type-error when passing the wrong dialect config', () => {
			defineConfig({
				dialect: 'pg',
				// @ts-expect-error
				dialectConfig,
			})

			defineConfig({
				// @ts-expect-error
				dialectConfig,
				dialect: 'pg',
			})
		})

		it('should type-error when name is not expected literal', () => {
			defineConfig({
				// @ts-expect-error
				dialect: 'moshe',
				// @ts-expect-error
				dialectConfig,
			})

			const dialect: string = 'better-sqlite3'

			defineConfig({
				// @ts-expect-error
				dialect,
				// @ts-expect-error
				dialectConfig,
			})
		})

		it('should type-error when also passing a kysely instance', () => {
			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig,
				// @ts-expect-error
				kysely,
			})
		})
	})
})

function init() {
	const dialect = {
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
	} satisfies Dialect
	const plugins = [new CamelCasePlugin()]
	const kysely = new Kysely({
		dialect,
		plugins,
	})
	const dialectConfig = {
		database: database('test.db'),
	} satisfies SqliteDialectConfig

	const migrationProvider = new TSFileMigrationProvider({
		migrationFolder: 'migrations',
	})
	const migrator = new Migrator({
		db: kysely,
		provider: migrationProvider,
	})

	const seedProvider = new FileSeedProvider({
		seedFolder: 'seeds',
	})
	const seeder = new Seeder({
		db: kysely,
		provider: seedProvider,
	})

	return {
		dialect,
		plugins,
		kysely,
		dialectConfig,
		migrationProvider,
		migrator,
		seedProvider,
		seeder,
	}
}
