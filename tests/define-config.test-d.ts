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
import { describe, expect, it } from 'vitest'
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
		it('should type-error when not passing dialect or Kysely instance', () => {
			// @ts-expect-error
			defineConfig({
				migrations: { migrator },
				seeds: { seeder },
			})
		})

		it('should not type-error when also passing a Kysely instance', () => {
			defineConfig({
				kysely,
				migrations: { migrator },
				seeds: { seeder },
			})

			defineConfig({
				kysely: () => kysely,
				migrations: { migrator },
				seeds: { seeder },
			})

			defineConfig({
				kysely: async () => kysely,
				migrations: { migrator },
				seeds: { seeder },
			})
		})

		it('should not type-error when also passing a dialect instance', () => {
			defineConfig({
				dialect,
				migrations: { migrator },
				seeds: { seeder },
			})

			defineConfig({
				dialect: () => dialect,
				migrations: { migrator },
				seeds: { seeder },
			})

			defineConfig({
				dialect: async () => dialect,
				migrations: { migrator },
				seeds: { seeder },
			})
		})

		it('should not type-error when also passing a dialect name', () => {
			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig,
				migrations: { migrator },
				seeds: { seeder },
			})

			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig: () => dialectConfig,
				migrations: { migrator },
				seeds: { seeder },
			})

			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig: async () => dialectConfig,
				migrations: { migrator },
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

				// @ts-expect-error
				defineConfig({
					migrations: { migrator },
					seeds: { provider: () => seedProvider },
				})

				// @ts-expect-error
				defineConfig({
					migrations: { migrator },
					seeds: { provider: async () => seedProvider },
				})
			})

			it('should not type-error when also passing a kysely instance', () => {
				defineConfig({
					kysely,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})

				defineConfig({
					kysely: () => kysely,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})

				defineConfig({
					kysely: async () => kysely,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})

				defineConfig({
					kysely,
					migrations: { migrator },
					seeds: { provider: () => seedProvider },
				})

				defineConfig({
					kysely: () => kysely,
					migrations: { migrator },
					seeds: { provider: () => seedProvider },
				})

				defineConfig({
					kysely: async () => kysely,
					migrations: { migrator },
					seeds: { provider: () => seedProvider },
				})

				defineConfig({
					kysely,
					migrations: { migrator },
					seeds: { provider: async () => seedProvider },
				})

				defineConfig({
					kysely: () => kysely,
					migrations: { migrator },
					seeds: { provider: async () => seedProvider },
				})

				defineConfig({
					kysely: async () => kysely,
					migrations: { migrator },
					seeds: { provider: async () => seedProvider },
				})
			})

			it('should not type-error when also passing a dialect instance', () => {
				defineConfig({
					dialect,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})

				defineConfig({
					dialect: () => dialect,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})

				defineConfig({
					dialect: async () => dialect,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})

				defineConfig({
					dialect,
					migrations: { migrator },
					seeds: { provider: () => seedProvider },
				})

				defineConfig({
					dialect: () => dialect,
					migrations: { migrator },
					seeds: { provider: () => seedProvider },
				})

				defineConfig({
					dialect: async () => dialect,
					migrations: { migrator },
					seeds: { provider: () => seedProvider },
				})

				defineConfig({
					dialect,
					migrations: { migrator },
					seeds: { provider: async () => seedProvider },
				})

				defineConfig({
					dialect: () => dialect,
					migrations: { migrator },
					seeds: { provider: async () => seedProvider },
				})

				defineConfig({
					dialect: async () => dialect,
					migrations: { migrator },
					seeds: { provider: async () => seedProvider },
				})
			})

			it('should not type-error when also passing a dialect name & config', () => {
				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: () => dialectConfig,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: async () => dialectConfig,
					migrations: { migrator },
					seeds: { provider: seedProvider },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig,
					migrations: { migrator },
					seeds: { provider: () => seedProvider },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: () => dialectConfig,
					migrations: { migrator },
					seeds: { provider: () => seedProvider },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: async () => dialectConfig,
					migrations: { migrator },
					seeds: { provider: () => seedProvider },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig,
					migrations: { migrator },
					seeds: { provider: async () => seedProvider },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: () => dialectConfig,
					migrations: { migrator },
					seeds: { provider: async () => seedProvider },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: async () => dialectConfig,
					migrations: { migrator },
					seeds: { provider: async () => seedProvider },
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

				defineConfig({
					kysely: () => kysely,
					migrations: { migrator },
					seeds: { seedFolder: 'seeds' },
				})

				defineConfig({
					kysely: async () => kysely,
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

				defineConfig({
					dialect: () => dialect,
					migrations: { migrator },
					seeds: { seedFolder: 'seeds' },
				})

				defineConfig({
					dialect: async () => dialect,
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

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: () => dialectConfig,
					migrations: { migrator },
					seeds: { seedFolder: 'seeds' },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: async () => dialectConfig,
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

			defineConfig({
				dialect,
				migrations: {
					migrator,
					// @ts-expect-error
					provider: () => migrationProvider,
				},
			})

			defineConfig({
				dialect,
				migrations: {
					migrator,
					// @ts-expect-error
					provider: async () => migrationProvider,
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

				// @ts-expect-error
				defineConfig({
					migrations: { provider: () => migrationProvider },
					seeds: { seeder },
				})

				// @ts-expect-error
				defineConfig({
					migrations: { provider: async () => migrationProvider },
					seeds: { seeder },
				})
			})

			it('should not type-error when also passing a kysely instance', () => {
				defineConfig({
					kysely,
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					kysely: () => kysely,
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					kysely: async () => kysely,
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					kysely,
					migrations: { provider: () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					kysely: () => kysely,
					migrations: { provider: () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					kysely: async () => kysely,
					migrations: { provider: () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					kysely,
					migrations: { provider: async () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					kysely: () => kysely,
					migrations: { provider: async () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					kysely: async () => kysely,
					migrations: { provider: async () => migrationProvider },
					seeds: { seeder },
				})
			})

			it('should not type-error when also passing a dialect instance', () => {
				defineConfig({
					dialect,
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: () => dialect,
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: async () => dialect,
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect,
					migrations: { provider: () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: () => dialect,
					migrations: { provider: () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: async () => dialect,
					migrations: { provider: () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect,
					migrations: { provider: async () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: () => dialect,
					migrations: { provider: async () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: async () => dialect,
					migrations: { provider: async () => migrationProvider },
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

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: () => dialectConfig,
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: async () => dialectConfig,
					migrations: { provider: migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig,
					migrations: { provider: () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: () => dialectConfig,
					migrations: { provider: () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: async () => dialectConfig,
					migrations: { provider: () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig,
					migrations: { provider: async () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: () => dialectConfig,
					migrations: { provider: async () => migrationProvider },
					seeds: { seeder },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: async () => dialectConfig,
					migrations: { provider: async () => migrationProvider },
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

				defineConfig({
					kysely: () => kysely,
					migrations: { migrationFolder: 'migrations' },
					seeds: { seeder },
				})

				defineConfig({
					kysely: async () => kysely,
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

				defineConfig({
					dialect: () => dialect,
					migrations: { migrationFolder: 'migrations' },
					seeds: { seeder },
				})

				defineConfig({
					dialect: async () => dialect,
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

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: () => dialectConfig,
					migrations: { migrationFolder: 'migrations' },
					seeds: { seeder },
				})

				defineConfig({
					dialect: 'better-sqlite3',
					dialectConfig: async () => dialectConfig,
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

			defineConfig({
				kysely,
				seeds: {
					provider: () => seedProvider,
					// @ts-expect-error
					seeder,
				},
			})

			defineConfig({
				kysely,
				seeds: {
					provider: async () => seedProvider,
					// @ts-expect-error
					seeder,
				},
			})

			defineConfig({
				kysely: () => kysely,
				seeds: {
					provider: seedProvider,
					// @ts-expect-error
					seeder,
				},
			})

			defineConfig({
				kysely: () => kysely,
				seeds: {
					provider: () => seedProvider,
					// @ts-expect-error
					seeder,
				},
			})

			defineConfig({
				kysely: () => kysely,
				seeds: {
					provider: async () => seedProvider,
					// @ts-expect-error
					seeder,
				},
			})

			defineConfig({
				kysely: async () => kysely,
				seeds: {
					provider: seedProvider,
					// @ts-expect-error
					seeder,
				},
			})

			defineConfig({
				kysely: async () => kysely,
				seeds: {
					provider: () => seedProvider,
					// @ts-expect-error
					seeder,
				},
			})

			defineConfig({
				kysely: async () => kysely,
				seeds: {
					provider: async () => seedProvider,
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

			defineConfig({
				kysely: () => kysely,
				seeds: {
					seeder,
					// @ts-expect-error
					seedFolder: 'seeds',
				},
			})

			defineConfig({
				kysely: async () => kysely,
				seeds: {
					seeder,
					// @ts-expect-error
					seedFolder: 'seeds',
				},
			})
		})
	})

	describe('when passing a Kysely instance', () => {
		it('should not type-error', () => {
			defineConfig({
				kysely,
			})

			defineConfig({
				kysely: () => kysely,
			})

			defineConfig({
				kysely: async () => kysely,
			})
		})

		it('should not type-error when also passing `destroyOnExit`', () => {
			defineConfig({
				destroyOnExit: true,
				kysely,
			})

			defineConfig({
				destroyOnExit: false,
				kysely,
			})

			defineConfig({
				destroyOnExit: true,
				kysely: () => kysely,
			})

			defineConfig({
				destroyOnExit: false,
				kysely: () => kysely,
			})

			defineConfig({
				destroyOnExit: true,
				kysely: async () => kysely,
			})

			defineConfig({
				destroyOnExit: false,
				kysely: async () => kysely,
			})
		})

		it('should type-error when also passing a dialect instance', () => {
			defineConfig({
				kysely,
				// @ts-expect-error
				dialect,
			})

			defineConfig({
				kysely: () => kysely,
				// @ts-expect-error
				dialect,
			})

			defineConfig({
				kysely: async () => kysely,
				// @ts-expect-error
				dialect,
			})

			defineConfig({
				kysely,
				// @ts-expect-error
				dialect: () => dialect,
			})

			defineConfig({
				kysely: () => kysely,
				// @ts-expect-error
				dialect: () => dialect,
			})

			defineConfig({
				kysely: async () => kysely,
				// @ts-expect-error
				dialect: () => dialect,
			})

			defineConfig({
				kysely,
				// @ts-expect-error
				dialect: async () => dialect,
			})

			defineConfig({
				kysely: () => kysely,
				// @ts-expect-error
				dialect: async () => dialect,
			})

			defineConfig({
				kysely: async () => kysely,
				// @ts-expect-error
				dialect: async () => dialect,
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

			defineConfig({
				kysely: () => kysely,
				// @ts-expect-error
				dialect: 'better-sqlite3',
				dialectConfig,
			})

			defineConfig({
				kysely: async () => kysely,
				// @ts-expect-error
				dialect: 'better-sqlite3',
				dialectConfig,
			})

			defineConfig({
				kysely,
				// @ts-expect-error
				dialect: 'better-sqlite3',
				dialectConfig: () => dialectConfig,
			})

			defineConfig({
				kysely: () => kysely,
				// @ts-expect-error
				dialect: 'better-sqlite3',
				dialectConfig: () => dialectConfig,
			})

			defineConfig({
				kysely: async () => kysely,
				// @ts-expect-error
				dialect: 'better-sqlite3',
				dialectConfig: () => dialectConfig,
			})

			defineConfig({
				kysely,
				// @ts-expect-error
				dialect: 'better-sqlite3',
				dialectConfig: async () => dialectConfig,
			})

			defineConfig({
				kysely: () => kysely,
				// @ts-expect-error
				dialect: 'better-sqlite3',
				dialectConfig: async () => dialectConfig,
			})

			defineConfig({
				kysely: async () => kysely,
				// @ts-expect-error
				dialect: 'better-sqlite3',
				dialectConfig: async () => dialectConfig,
			})
		})

		it('should type-error when also passing plugins', () => {
			defineConfig({
				kysely,
				// @ts-expect-error
				plugins,
			})

			defineConfig({
				// @ts-expect-error
				plugins,
				kysely,
			})

			defineConfig({
				kysely: () => kysely,
				// @ts-expect-error
				plugins,
			})

			defineConfig({
				kysely: async () => kysely,
				// @ts-expect-error
				plugins,
			})

			defineConfig({
				kysely,
				// @ts-expect-error
				plugins: () => plugins,
			})

			defineConfig({
				kysely: () => kysely,
				// @ts-expect-error
				plugins: () => plugins,
			})

			defineConfig({
				kysely: async () => kysely,
				// @ts-expect-error
				plugins: () => plugins,
			})

			defineConfig({
				kysely,
				// @ts-expect-error
				plugins: async () => plugins,
			})

			defineConfig({
				kysely: () => kysely,
				// @ts-expect-error
				plugins: async () => plugins,
			})

			defineConfig({
				kysely: async () => kysely,
				// @ts-expect-error
				plugins: async () => plugins,
			})
		})
	})

	describe('when passing a dialect instance', () => {
		it('should not type-error', () => {
			defineConfig({
				dialect,
			})

			defineConfig({
				dialect: () => dialect,
			})

			defineConfig({
				dialect: async () => dialect,
			})
		})

		it('should not type-error when also passing `destroyOnExit`', () => {
			defineConfig({
				destroyOnExit: true,
				dialect,
			})

			defineConfig({
				destroyOnExit: false,
				dialect,
			})

			defineConfig({
				destroyOnExit: true,
				dialect: () => dialect,
			})

			defineConfig({
				destroyOnExit: false,
				dialect: () => dialect,
			})

			defineConfig({
				destroyOnExit: true,
				dialect: async () => dialect,
			})

			defineConfig({
				destroyOnExit: false,
				dialect: async () => dialect,
			})
		})

		it('should type-error when also passing a dialect config', () => {
			defineConfig({
				dialect,
				// @ts-expect-error
				dialectConfig,
			})

			defineConfig({
				dialectConfig,
				// @ts-expect-error
				dialect,
			})

			defineConfig({
				dialect: () => dialect,
				// @ts-expect-error
				dialectConfig,
			})

			defineConfig({
				dialect: async () => dialect,
				// @ts-expect-error
				dialectConfig,
			})

			defineConfig({
				dialect,
				// @ts-expect-error
				dialectConfig: () => dialectConfig,
			})

			defineConfig({
				dialect: () => dialect,
				// @ts-expect-error
				dialectConfig: () => dialectConfig,
			})

			defineConfig({
				dialect: async () => dialect,
				// @ts-expect-error
				dialectConfig: () => dialectConfig,
			})

			defineConfig({
				dialect,
				// @ts-expect-error
				dialectConfig: async () => dialectConfig,
			})

			defineConfig({
				dialect: () => dialect,
				// @ts-expect-error
				dialectConfig: async () => dialectConfig,
			})

			defineConfig({
				dialect: async () => dialect,
				// @ts-expect-error
				dialectConfig: async () => dialectConfig,
			})
		})

		it('should type-error when also passing a kysely instance', () => {
			expect('already checked above').toBeTruthy()
		})
	})

	describe('when passing a dialect name + config', () => {
		it('should not type-error', () => {
			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig,
			})

			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig: () => dialectConfig,
			})

			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig: async () => dialectConfig,
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
				dialectConfig,
				// @ts-expect-error
				dialect: 'pg',
			})

			defineConfig({
				dialect: 'pg',
				// @ts-expect-error
				dialectConfig: () => dialectConfig,
			})

			defineConfig({
				dialect: 'pg',
				// @ts-expect-error
				dialectConfig: async () => dialectConfig,
			})
		})

		it('should type-error when name is not expected literal', () => {
			defineConfig({
				// @ts-expect-error
				dialect: 'moshe',
			})

			const dialect: string = 'better-sqlite3'

			defineConfig({
				// @ts-expect-error
				dialect,
			})
		})

		it('should type-error when also passing a kysely instance', () => {
			expect('already checked above').toBeTruthy()
		})

		it('should not type-error when also passing `destroyOnExit`', () => {
			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig,
				destroyOnExit: true,
			})

			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig,
				destroyOnExit: false,
			})

			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig: () => dialectConfig,
				destroyOnExit: true,
			})

			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig: () => dialectConfig,
				destroyOnExit: false,
			})

			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig: async () => dialectConfig,
				destroyOnExit: true,
			})

			defineConfig({
				dialect: 'better-sqlite3',
				dialectConfig: async () => dialectConfig,
				destroyOnExit: false,
			})
		})
	})

	it('environment override issue - https://github.com/kysely-org/kysely-ctl/issues/53', () => {
		defineConfig({
			dialect: dialect,
			plugins: plugins,
			migrations: {
				migrationFolder: './src/db/migrations',
			},
			$development: {
				seeds: {
					// this type-errored before the fix
					seedFolder: './src/db/seeds/development',
				},
			},
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
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const migrator = (db: Kysely<any>) =>
		new Migrator({
			db,
			provider: migrationProvider,
		})

	const seedProvider = new FileSeedProvider({
		seedFolder: 'seeds',
	})
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const seeder = (db: Kysely<any>) =>
		new Seeder({
			db,
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
