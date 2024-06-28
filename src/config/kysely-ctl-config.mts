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
	migrationFolder?: never
	migrator: Migrator
	provider?: never
}

type MigratorlessMigrationsConfig = MigrationsBaseConfig &
	(
		| {
				migrationFolder?: string
				migrator?: never
				provider?: never
		  }
		| {
				migrationFolder?: never
				migrator?: never
				provider: MigrationProvider
		  }
	)

type SeederfulSeedsConfig = Pick<SeedsBaseConfig, 'getSeedPrefix'> & {
	provider?: never
	seeder: Seeder
	seedsFolder?: never
}

type SeederlessSeedsConfig = SeedsBaseConfig &
	(
		| {
				provider?: never
				seeder?: never
				seedFolder?: string
		  }
		| {
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
		migrationFolder: string
		migrator?: Migrator
		provider?: MigrationProvider
	}
	plugins?: KyselyPlugin[]
	seeds: SetRequired<SeedsBaseConfig, 'getSeedPrefix'> & {
		provider?: SeedProvider
		seeder?: Seeder
		seedFolder: string
	}
}

export type MigrationsBaseConfig = Omit<MigratorProps, 'db' | 'provider'> & {
	getMigrationPrefix?(): string | Promise<string>
}

export type SeedsBaseConfig = Omit<SeederProps, 'db' | 'provider'> & {
	getSeedPrefix?(): string | Promise<string>
}
