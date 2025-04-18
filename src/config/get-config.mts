import { loadConfig } from 'c12'
import { consola } from 'consola'
import { getJiti } from '../utils/jiti.mjs'
import { getCWD } from './get-cwd.mjs'
import { getMillisPrefix } from './get-file-prefix.mjs'
import type {
	KyselyCTLConfig,
	ResolvedKyselyCTLConfig,
} from './kysely-ctl-config.mjs'

export interface GetConfigArgs {
	cwd?: string
	debug?: boolean
	environment?: string
	'experimental-resolve-tsconfig-paths'?: boolean
	'filesystem-caching'?: boolean
}

export async function getConfig(
	args: GetConfigArgs,
): Promise<ResolvedKyselyCTLConfig> {
	const cwd = getCWD(args)

	const jiti = await getJiti({
		debug: args.debug,
		filesystemCaching: args['filesystem-caching'],
		experimentalResolveTSConfigPaths:
			args['experimental-resolve-tsconfig-paths'],
	})

	const loadedConfig = await loadConfig<KyselyCTLConfig>({
		cwd,
		dotenv: true,
		envName: args.environment,
		jiti,
		globalRc: false,
		name: 'kysely',
		packageJson: false,
		rcFile: false,
	})

	consola.debug(loadedConfig)

	const { config, ...configMetadata } = loadedConfig

	return {
		...config,
		args,
		configMetadata,
		cwd,
		migrations: {
			allowJS: false,
			getMigrationPrefix: getMillisPrefix,
			migrationFolder: 'migrations',
			...(config.migrations || {}),
		},
		seeds: {
			allowJS: false,
			getSeedPrefix: getMillisPrefix,
			seedFolder: 'seeds',
			...(config.seeds || {}),
		},
	}
}

export function configFileExists(config: ResolvedKyselyCTLConfig): boolean {
	const { configFile } = config.configMetadata

	return configFile !== undefined && configFile !== 'kysely.config'
}

export async function getConfigOrFail(
	args: GetConfigArgs,
): Promise<ResolvedKyselyCTLConfig> {
	const config = await getConfig(args)

	if (!configFileExists(config)) {
		throw new Error('No config file found')
	}

	return config
}
