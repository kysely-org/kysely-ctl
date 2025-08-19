// biome-ignore lint/performance/noBarrelFile: it's fine, library entry point.
export {
	type DefineConfigInput,
	defineConfig,
} from './config/define-config.mjs'
export { DUMMY_DIALECT_CONFIG } from './config/dummy-dialect-config.mjs'
export { getKnexTimestampPrefix } from './config/get-file-prefix.mjs'
export type {
	KyselyCoreDialect,
	KyselyCTLConfig,
	KyselyDialect,
	KyselyDialectConfig,
	KyselyOrganizationDialect,
	MigrationsBaseConfig,
	ResolvableKyselyDialect,
	SeedsBaseConfig,
} from './config/kysely-ctl-config.mjs'
export {
	TSFileMigrationProvider,
	type TSFileMigrationProviderProps,
} from './kysely/ts-file-migration-provider.mjs'
export {
	FileSeedProvider,
	type FileSeedProviderProps,
} from './seeds/file-seed-provider.mjs'
export {
	type Seed,
	Seeder,
	type SeederProps,
	type SeedInfo,
	type SeedProvider,
	type SeedResult,
	type SeedResultSet,
} from './seeds/seeder.mjs'
