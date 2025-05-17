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
		? {
				destroyOnExit?: boolean
				dialect: Dialect
				dialectConfig: KyselyDialectConfig<Dialect>
				kysely?: never
				migrations?: MigratorlessMigrationsConfig | MigratorfulMigrationsConfig
				plugins?: KyselyPlugin[]
				seeds?: SeederlessSeedsConfig | SeederfulSeedsConfig
			}
		:
				| {
						destroyOnExit?: boolean
						dialect: KyselyDialectInstance
						dialectConfig?: never
						migrations?:
							| MigratorlessMigrationsConfig
							| MigratorfulMigrationsConfig
						plugins?: KyselyPlugin[]
						seeds?: SeederlessSeedsConfig | SeederfulSeedsConfig
				  }
				| {
						destroyOnExit?: boolean
						// biome-ignore lint/suspicious/noExplicitAny: `any` is required here, for now.
						kysely: Kysely<any>
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
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	migrator(this: void, db: Kysely<any>): Migrator | Promise<Migrator>
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

type SeederfulSeedsConfig = Pick<SeedsBaseConfig, 'getSeedPrefix'> & {
	allowJS?: never
	provider?: never
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	seeder(db: Kysely<any>): Seeder | Promise<Seeder>
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
	args: GetConfigArgs
	configMetadata: Omit<
		ResolvedConfig<KyselyCTLConfig, ConfigLayerMeta>,
		'config'
	>
	cwd: string
	destroyOnExit?: boolean
	dialect?: KyselyDialect
	// biome-ignore lint/suspicious/noExplicitAny: `any` is required here, for now.
	dialectConfig?: KyselyDialectConfig<any>
	// biome-ignore lint/suspicious/noExplicitAny: `any` is required here, for now.
	kysely?: Kysely<any>
	migrations: SetRequired<MigrationsBaseConfig, 'getMigrationPrefix'> & {
		allowJS: boolean
		migrationFolder: string
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		migrator?(db: Kysely<any>): Migrator | Promise<Migrator>
		provider?: MigrationProvider
	}
	plugins?: KyselyPlugin[]
	seeds: SetRequired<SeedsBaseConfig, 'getSeedPrefix'> & {
		allowJS: boolean
		provider?: SeedProvider
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		seeder?(db: Kysely<any>): Seeder | Promise<Seeder>
		seedFolder: string
	}
}

export type MigrationsBaseConfig = Omit<MigratorProps, 'db' | 'provider'> & {
	getMigrationPrefix?(): string | Promise<string>
}

export type SeedsBaseConfig = Omit<SeederProps, 'db' | 'provider'> & {
	getSeedPrefix?(): string | Promise<string>
}
