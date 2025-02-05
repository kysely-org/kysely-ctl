import { loadConfig } from 'c12'
import { consola } from 'consola'
import { getJitiAlias } from '../utils/jiti'
import { getCWD } from './get-cwd.mjs'
import { getMillisPrefix } from './get-file-prefix.mjs'
import type {
	KyselyCTLConfig,
	ResolvedKyselyCTLConfig,
} from './kysely-ctl-config.mjs'

export interface ArgsLike {
	cwd?: string
	debug?: boolean
	environment?: string
	'filesystem-caching'?: boolean
}

export async function getConfig(
	args: ArgsLike,
): Promise<ResolvedKyselyCTLConfig> {
	const cwd = getCWD(args)

	const loadedConfig = await loadConfig<KyselyCTLConfig>({
		cwd,
		dotenv: true,
		envName: args.environment,
		jitiOptions: {
			alias: await getJitiAlias(),
			debug: Boolean(args.debug),
			fsCache: Boolean(args['filesystem-caching']),
		},
		globalRc: false,
		name: 'kysely',
		packageJson: false,
		rcFile: false,
	})

	consola.debug(loadedConfig)

	const { config, ...configMetadata } = loadedConfig

	return {
		...config,
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
	args: ArgsLike,
): Promise<ResolvedKyselyCTLConfig> {
	const config = await getConfig(args)

	if (!configFileExists(config)) {
		throw new Error('No config file found')
	}

	return config
}
