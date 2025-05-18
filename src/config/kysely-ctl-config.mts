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
import type { GetConfigArgs } from './get-config.mjs'

export type KyselyDialect =
	| ResolvableKyselyDialect
	| OrFactory<KyselyDialectInstance>

export type ResolvableKyselyDialect =
	| KyselyCoreDialect
	| KyselyOrganizationDialect

export type KyselyCoreDialect = 'pg' | 'mysql2' | 'tedious' | 'better-sqlite3'

export type KyselyOrganizationDialect = 'postgres'

// biome-ignore lint/suspicious/noExplicitAny: it's fine.
export type Factory<T, P extends any[] = []> = (...args: P) => T | Promise<T>

// biome-ignore lint/suspicious/noExplicitAny: it's fine.
export type OrFactory<T, P extends any[] = []> = T | Factory<T, P>

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
		? {
				destroyOnExit?: boolean
				dialect: Dialect
				dialectConfig: OrFactory<KyselyDialectConfig<Dialect>>
				kysely?: never
				migrations?: MigratorlessMigrationsConfig | MigratorfulMigrationsConfig
				plugins?: OrFactory<KyselyPlugin[]>
				seeds?: SeederlessSeedsConfig | SeederfulSeedsConfig
			}
		:
				| {
						destroyOnExit?: boolean
						dialect: OrFactory<KyselyDialectInstance>
						dialectConfig?: never
						migrations?:
							| MigratorlessMigrationsConfig
							| MigratorfulMigrationsConfig
						plugins?: OrFactory<KyselyPlugin[]>
						seeds?: SeederlessSeedsConfig | SeederfulSeedsConfig
				  }
				| {
						destroyOnExit?: boolean
						// biome-ignore lint/suspicious/noExplicitAny: `any` is required here, for now.
						kysely: OrFactory<Kysely<any>>
						migrations?:
							| MigratorlessMigrationsConfig
							| MigratorfulMigrationsConfig
						seeds?: SeederlessSeedsConfig | SeederfulSeedsConfig
				  }

type MigratorfulMigrationsConfig = Pick<
	MigrationsBaseConfig,
	'getMigrationPrefix'
> & {
	allowJS?: never
	migrationFolder?: never
	// biome-ignore lint/suspicious/noExplicitAny: it's fine.
	migrator: Factory<Migrator, [db: Kysely<any>]>
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
				provider: OrFactory<MigrationProvider>
		  }
	)

type SeederfulSeedsConfig = Pick<SeedsBaseConfig, 'getSeedPrefix'> & {
	allowJS?: never
	provider?: never
	// biome-ignore lint/suspicious/noExplicitAny: it's fine.
	seeder: Factory<Seeder, [db: Kysely<any>]>
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
				provider: OrFactory<SeedProvider>
				seeder?: never
				seedFolder?: never
		  }
	)

export interface ResolvedKyselyCTLConfig {
	args: GetConfigArgs
	configMetadata: Omit<
		ResolvedConfig<KyselyCTLConfig, ConfigLayerMeta>,
		'config'
	>
	cwd: string
	destroyOnExit?: boolean
	dialect?: KyselyDialect
	dialectConfig?: OrFactory<KyselyDialectConfig<ResolvableKyselyDialect>>
	// biome-ignore lint/suspicious/noExplicitAny: `any` is required here, for now.
	kysely?: OrFactory<Kysely<any>>
	migrations: SetRequired<MigrationsBaseConfig, 'getMigrationPrefix'> & {
		allowJS: boolean
		migrationFolder: string
		// biome-ignore lint/suspicious/noExplicitAny: `any` is required here, for now.
		migrator?: Factory<Migrator, [db: Kysely<any>]>
		provider?: OrFactory<MigrationProvider>
	}
	plugins?: OrFactory<KyselyPlugin[]>
	seeds: SetRequired<SeedsBaseConfig, 'getSeedPrefix'> & {
		allowJS: boolean
		provider?: OrFactory<SeedProvider>
		// biome-ignore lint/suspicious/noExplicitAny: `any` is required here, for now.
		seeder?: Factory<Seeder, [db: Kysely<any>]>
		seedFolder: string
	}
}

export type MigrationsBaseConfig = Omit<MigratorProps, 'db' | 'provider'> & {
	getMigrationPrefix?(): string | Promise<string>
}

export type SeedsBaseConfig = Omit<SeederProps, 'db' | 'provider'> & {
	getSeedPrefix?(): string | Promise<string>
}
