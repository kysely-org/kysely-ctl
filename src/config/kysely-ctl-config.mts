import type { ConfigLayerMeta, ResolvedConfig } from 'c12'
import type {
	Kysely,
	Dialect as KyselyDialectInstance,
	KyselyPlugin,
	MigrationProvider,
	Migrator,
	MigratorProps,
	MssqlDialectConfig,
	MysqlDialectConfig,
	PostgresDialectConfig,
	SqliteDialectConfig,
} from 'kysely'
import type { PostgresJSDialectConfig } from 'kysely-postgres-js'
import type { SetRequired } from 'type-fest'
import type { SeedProvider, Seeder, SeederProps } from '../seeds/seeder.mjs'

export type KyselyDialect =
	| KyselyCoreDialect
	| KyselyOrganizationDialect
	| KyselyDialectInstance

export type ResolvableKyselyDialect =
	| KyselyCoreDialect
	| KyselyOrganizationDialect

export type KyselyCoreDialect = 'pg' | 'mysql2' | 'tedious' | 'better-sqlite3'

export type KyselyOrganizationDialect = 'postgres'

interface KyselyDialectConfigDictionary
	extends Record<ResolvableKyselyDialect, unknown> {
	'better-sqlite3': SqliteDialectConfig
	mysql2: MysqlDialectConfig
	pg: PostgresDialectConfig
	postgres: PostgresJSDialectConfig
	tedious: MssqlDialectConfig
}

export type KyselyDialectConfig<Dialect extends KyselyDialect> =
	Dialect extends ResolvableKyselyDialect
		? KyselyDialectConfigDictionary[Dialect]
		: never

export type KyselyCTLConfig<Dialect extends KyselyDialect = KyselyDialect> =
	Dialect extends ResolvableKyselyDialect
		?
				| {
						dialect: Dialect
						dialectConfig: KyselyDialectConfig<Dialect>
						migrations: MigratorfulMigrationsConfig
						plugins?: KyselyPlugin[]
						seeds?: SeederlessSeedsConfig
				  }
				| {
						dialect: Dialect
						dialectConfig: KyselyDialectConfig<Dialect>
						migrations?: MigratorlessMigrationsConfig
						plugins?: KyselyPlugin[]
						seeds: SeederfulSeedsConfig
				  }
				| {
						dialect: Dialect
						dialectConfig: KyselyDialectConfig<Dialect>
						migrations?: MigratorlessMigrationsConfig
						plugins?: KyselyPlugin[]
						seeds?: SeederlessSeedsConfig
				  }
		:
				| {
						dialect: KyselyDialectInstance
						migrations: MigratorfulMigrationsConfig
						plugins?: KyselyPlugin[]
						seeds?: SeederlessSeedsConfig
				  }
				| {
						dialect: KyselyDialectInstance
						migrations?: MigratorlessMigrationsConfig
						plugins?: KyselyPlugin[]
						seeds: SeederfulSeedsConfig
				  }
				| {
						dialect: KyselyDialectInstance
						migrations?: MigratorlessMigrationsConfig
						plugins?: KyselyPlugin[]
						seeds?: SeederlessSeedsConfig
				  }
				| {
						kysely: Kysely<any>
						migrations: MigratorfulMigrationsConfig
						seeds?: SeederlessSeedsConfig
				  }
				| {
						kysely: Kysely<any>
						migrations?: MigratorlessMigrationsConfig
						seeds: SeederfulSeedsConfig
				  }
				| {
						kysely: Kysely<any>
						migrations?: MigratorlessMigrationsConfig
						seeds?: SeederlessSeedsConfig
				  }
				| {
						dialect?: never
						kysely?: never
						migrations: MigratorfulMigrationsConfig
						plugins?: never
						seeds: SeederfulSeedsConfig
				  }

type MigratorfulMigrationsConfig = Pick<
	MigrationsBaseConfig,
	'getMigrationPrefix'
> & {
	allowJS?: never
	migrationFolder?: never
	migrator: Migrator
	provider?: never
}

type MigratorlessMigrationsConfig = MigrationsBaseConfig &
	(
		| {
				allowJS?: boolean
				migrationFolder?: string
				migrator?: never
				provider?: never
		  }
		| {
				allowJS?: never
				migrationFolder?: never
				migrator?: never
				provider: MigrationProvider
		  }
	)

type SeederfulSeedsConfig = Pick<
	SeedsBaseConfig,
	'databaseInterface' | 'getSeedPrefix'
> & {
	allowJS?: never
	provider?: never
	seeder: Seeder
	seedFolder?: never
}

type SeederlessSeedsConfig = SeedsBaseConfig &
	(
		| {
				allowJS?: boolean
				provider?: never
				seeder?: never
				seedFolder?: string
		  }
		| {
				allowJS?: never
				provider: SeedProvider
				seeder?: never
				seedFolder?: never
		  }
	)

export interface ResolvedKyselyCTLConfig {
	configMetadata: Omit<
		ResolvedConfig<KyselyCTLConfig, ConfigLayerMeta>,
		'config'
	>
	cwd: string
	dialect?: KyselyDialect
	dialectConfig?: KyselyDialectConfig<any>
	kysely?: Kysely<any>
	migrations: SetRequired<MigrationsBaseConfig, 'getMigrationPrefix'> & {
		allowJS: boolean
		migrationFolder: string
		migrator?: Migrator
		provider?: MigrationProvider
	}
	plugins?: KyselyPlugin[]
	seeds: SetRequired<SeedsBaseConfig, 'getSeedPrefix'> & {
		allowJS: boolean
		provider?: SeedProvider
		seeder?: Seeder
		seedFolder: string
	}
}

export type MigrationsBaseConfig = Omit<MigratorProps, 'db' | 'provider'> & {
	getMigrationPrefix?(): string | Promise<string>
}

export type SeedsBaseConfig = Omit<SeederProps, 'db' | 'provider'> & {
	/**
	 * Generate type-safe seed files that rely on an existing database interface.
	 *
	 * Default is `'auto'`.
	 *
	 * When `'auto'`:
	 *
	 * - When `kysely-codegen` is installed, it will use `import type { DB } from 'kysely-codegen'`.
	 * - **SOON** When `prisma-kysely` is installed, it will try to find the right path and use `import type { DB } from 'path/to/types'`.
	 * - **SOON** When `kanel-kysely` is installed, it will try to find the right path and use `import type Database from 'path/to/Database'`.
	 * - Otherwise, it will fallback to `Kysely<any>`.
	 *
	 * When `'off'`, it will fallback to `Kysely<any>`.
	 *
	 * When a config object is passed, it will use the specified database interface path and name.
	 */
	databaseInterface?: 'auto' | 'off' | DatabaseInterfaceConfig
	getSeedPrefix?(): string | Promise<string>
}

export type DatabaseInterface = 'auto' | 'off' | DatabaseInterfaceConfig

export interface DatabaseInterfaceConfig {
	/**
	 * Whether the database interface is the default export.
	 *
	 * Default is `false`.
	 */
	isDefaultExport?: boolean

	/**
	 * Name of the database interface.
	 *
	 * Default is `'DB'`.
	 */
	name?: string

	/**
	 * Path to the database interface, relative to the seed folder.
	 */
	path: string
}
