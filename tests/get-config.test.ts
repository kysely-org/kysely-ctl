import { readdir } from 'node:fs/promises'
import { loadConfig } from 'c12'
import { Kysely, SqliteDialect } from 'kysely'
import { FileMigrationProvider, Migrator } from 'kysely/migration'
import { join, resolve } from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getConfig } from '../src/config/get-config.mjs'
import type { KyselyCTLConfig } from '../src/config/kysely-ctl-config.mjs'
import { getKysely } from '../src/kysely/get-kysely.mjs'
import { getMigrator } from '../src/kysely/get-migrator.mjs'
import { TSFileMigrationProvider } from '../src/kysely/ts-file-migration-provider.mjs'

vi.mock('c12', () => ({ loadConfig: vi.fn<() => never>() }))

afterEach(() => vi.clearAllMocks())

describe('migration folder configuration', () => {
	it.each([
		new FileMigrationProvider({
			fs: { readdir },
			path: { join },
			migrationFolder: './src/migrations',
		}),
		new TSFileMigrationProvider({ migrationFolder: './src/migrations' }),
	])('uses the folder from a custom file provider', async (provider) => {
		const kysely = vi.fn(() => {
			throw new Error('The database should not be initialized')
		})
		const config = await resolveConfig({ kysely, migrations: { provider } })

		expect(config.migrations.migrationFolder).toBe(resolve('src/migrations'))
		expect(kysely).not.toHaveBeenCalled()
	})

	it('resolves an async provider factory once', async () => {
		const provider = new TSFileMigrationProvider({
			migrationFolder: '/custom/migrations',
		})
		const factory = vi.fn(async () => provider)
		const config = await resolveConfig({
			kysely: vi.fn<() => never>(),
			migrations: { provider: factory },
		})

		expect(config.migrations.migrationFolder).toBe('/custom/migrations')
		expect(config.migrations.provider).toBe(provider)
		expect(factory).toHaveBeenCalledOnce()
	})

	it('uses the migrator provider and reuses the resolved instances', async () => {
		const connect = vi.fn(async () => {
			throw new Error('The database should not be connected')
		})
		const db = new Kysely({ dialect: new SqliteDialect({ database: connect }) })
		const kysely = vi.fn(() => db)
		const provider = new FileMigrationProvider({
			fs: { readdir },
			path: { join },
			migrationFolder: '/custom/migrations',
		})
		const migrator = new Migrator({ db, provider })
		const factory = vi.fn(async () => migrator)
		const config = await resolveConfig({
			kysely,
			migrations: { migrator: factory },
		})

		expect(config.migrations.migrationFolder).toBe('/custom/migrations')
		expect(await getKysely(config)).toBe(db)
		expect(await getMigrator({ ...config, kysely: db })).toBe(migrator)
		expect(kysely).toHaveBeenCalledOnce()
		expect(factory).toHaveBeenCalledExactlyOnceWith(db)
		expect(connect).not.toHaveBeenCalled()
		await db.destroy()
	})

	it('keeps the default folder for providers without a disk location', async () => {
		const provider = { getMigrations: vi.fn(async () => ({})) }
		const config = await resolveConfig({
			kysely: vi.fn<() => never>(),
			migrations: { provider },
		})

		expect(config.migrations.migrationFolder).toBe('/project/migrations')
		expect(provider.getMigrations).not.toHaveBeenCalled()
	})

	it('keeps an explicitly configured folder without resolving a database', async () => {
		const kysely = vi.fn<() => never>()
		const config = await resolveConfig({
			kysely,
			migrations: { migrationFolder: '../custom/migrations' },
		})

		expect(config.migrations.migrationFolder).toBe('/project/custom/migrations')
		expect(kysely).not.toHaveBeenCalled()
	})
})

async function resolveConfig(config: KyselyCTLConfig) {
	vi.mocked(loadConfig).mockResolvedValue({
		config,
		configFile: '/project/.config/kysely.config.mts',
		layers: [],
	})

	const resolved = await getConfig({
		config: '/project/.config/kysely.config.mts',
	})

	if (!resolved) {
		throw new Error('Expected the configuration to resolve')
	}

	return resolved
}
