import { loadConfig } from 'c12'
import { consola } from 'consola'
import { dirname, resolve } from 'pathe'
import { findNearestFile } from 'pkg-types'
import { getJiti } from '../utils/jiti.mjs'
import { getCWD } from './get-cwd.mjs'
import { getMillisPrefix } from './get-file-prefix.mjs'
import type {
	KyselyCTLConfig,
	MigrationsBaseConfig,
	ResolvedKyselyCTLConfig,
} from './kysely-ctl-config.mjs'

export interface GetConfigArgs {
	cwd?: string
	debug?: boolean
	environment?: string
	'experimental-resolve-tsconfig-paths'?: boolean
	'filesystem-caching'?: boolean
	transaction?: boolean
}

export async function getConfig(
	args: GetConfigArgs,
): Promise<ResolvedKyselyCTLConfig | null> {
	const configPath = await findNearestKyselyConfigPath()

	if (!configPath) {
		return null
	}

	const jiti = await getJiti({
		debug: args.debug,
		filesystemCaching: args['filesystem-caching'],
		experimentalResolveTSConfigPaths:
			args['experimental-resolve-tsconfig-paths'],
	})

	const loadedConfig = await loadConfig<KyselyCTLConfig>({
		cwd: configPath,
		dotenv: true,
		envName: args.environment,
		jiti,
		globalRc: false,
		name: 'kysely',
		packageJson: false,
		rcFile: false,
	})

	consola.debug('loadedConfig', loadedConfig)

	const { config, ...configMetadata } = loadedConfig

	return {
		...config,
		args,
		configMetadata,
		cwd: configPath,
		migrations: {
			allowJS: false,
			getMigrationPrefix: getMillisPrefix,
			...config.migrations,
			disableTransactions:
				args.transaction === false ||
				(config.migrations as MigrationsBaseConfig | undefined)
					?.disableTransactions,
			migrationFolder: resolveCollectionFolderPath(
				configPath,
				config.migrations?.migrationFolder,
				'migrations',
			),
		},
		seeds: {
			allowJS: false,
			getSeedPrefix: getMillisPrefix,
			...config.seeds,
			seedFolder: resolveCollectionFolderPath(
				configPath,
				config.seeds?.seedFolder,
				'seeds',
			),
		},
	} as never
}

export async function getConfigOrFail(
	args: GetConfigArgs,
): Promise<ResolvedKyselyCTLConfig> {
	const config = await getConfig(args)

	if (!configFileExists(config)) {
		throw new Error(
			'No config file found. Try creating one by running `kysely init`.',
		)
	}

	return config
}

export function configFileExists(
	config: ResolvedKyselyCTLConfig | null,
): config is ResolvedKyselyCTLConfig {
	if (!config) {
		return false
	}

	const { configFile } = config.configMetadata

	return configFile !== undefined && configFile !== 'kysely.config'
}

async function findNearestKyselyConfigPath(): Promise<string | null> {
	try {
		const kyselyConfigPath = await findNearestFile(
			[
				'.config/kysely.config.ts',
				'kysely.config.ts',
				'.config/kysely.config.mts',
				'kysely.config.mts',
				'.config/kysely.config.cts',
				'kysely.config.cts',
			],
			{ startingFrom: getCWD() },
		)

		consola.debug('found kysely config file at', kyselyConfigPath)

		return dirname(kyselyConfigPath)
	} catch {
		return null
	}
}

function resolveCollectionFolderPath(
	configPath: string,
	configuredFolderPath: string | null | undefined,
	defaultFolderName: string,
): string {
	const defaultRelativeFolderPath = `${configPath.endsWith('.config') ? '../' : './'}${defaultFolderName}`

	return resolve(configPath, configuredFolderPath || defaultRelativeFolderPath)
}
