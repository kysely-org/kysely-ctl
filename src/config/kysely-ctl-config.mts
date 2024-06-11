import type { ConfigLayerMeta, ResolvedConfig } from 'c12'
import type {
	Dialect as KyselyDialectInstance,
	KyselyPlugin,
	MigratorProps,
	MigrationProvider,
	MssqlDialectConfig,
	MysqlDialectConfig,
	PostgresDialectConfig,
	SqliteDialectConfig,
	Migrator,
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
	KyselyCTLConfigBase &
		(Dialect extends ResolvableKyselyDialect
			? {
					/**
					 * Name of an underlying database driver library, or a Kysely dialect
					 * instance.
					 *
					 * In case of the first, you're required to also pass a suitable `dialectConfig`.
					 */
					dialect: Dialect
					/**
					 * Configuration passed to a dialect in case a name was passed in `dialect`.
					 */
					dialectConfig: KyselyDialectConfig<Dialect>
				}
			: {
					/**
					 * A name of an underlying database driver library, or a Kysely dialect
					 * instance.
					 *
					 * In case of the first, you're required to also pass a suitable `dialectConfig`.
					 */
					dialect: KyselyDialectInstance
				}) &
		(
			| {
					migrations: MigrationsBaseConfig & {
						migrationFolder?: string
						migrator?: never
						provider?: never
					}
			  }
			| {
					migrations?: MigrationsBaseConfig & {
						migrationFolder?: never
						migrator?: never
						provider: MigrationProvider
					}
			  }
			| {
					migrations?: Pick<MigrationsBaseConfig, 'getMigrationPrefix'> & {
						migrationFolder?: never
						migrator: Migrator
						provider?: never
					}
			  }
		) &
		(
			| {
					seeds?: SeedsBaseConfig & {
						provider?: never
						seeder?: never
						seedFolder?: string
					}
			  }
			| {
					seeds?: SeedsBaseConfig & {
						provider: SeedProvider
						seeder?: never
						seedFolder?: never
					}
			  }
			| {
					seeds?: Pick<SeedsBaseConfig, 'getSeedPrefix'> & {
						provider?: never
						seeder: Seeder
						seedFolder?: never
					}
			  }
		)

export interface KyselyCTLConfigBase {
	plugins?: KyselyPlugin[]
}

export type ResolvedKyselyCTLConfig<
	Dialect extends KyselyDialect = KyselyDialect,
> = (Dialect extends ResolvableKyselyDialect
	? {
			dialect: Dialect
			dialectConfig: KyselyDialectConfig<Dialect>
		}
	: {
			dialect: KyselyDialectInstance
		}) & {
	configMetadata: Omit<
		ResolvedConfig<KyselyCTLConfig, ConfigLayerMeta>,
		'config'
	>
	cwd: string
	migrations: SetRequired<MigrationsBaseConfig, 'getMigrationPrefix'> & {
		migrationFolder: string
		migrator?: Migrator
		provider?: MigrationProvider
	}
	plugins: KyselyPlugin[]
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
