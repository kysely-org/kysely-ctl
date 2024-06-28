import { loadConfig } from 'c12'
import { consola } from 'consola'
import { getCWD } from './get-cwd.mjs'
import { getMillisPrefix } from './get-file-prefix.mjs'
import type {
	KyselyCTLConfig,
	ResolvedKyselyCTLConfig,
} from './kysely-ctl-config.mjs'

export interface ArgsLike {
	cwd?: string
	environment?: string
}

export async function getConfig(
	args: ArgsLike,
): Promise<ResolvedKyselyCTLConfig> {
	const cwd = getCWD(args)

	const loadedConfig = await loadConfig<KyselyCTLConfig>({
		cwd,
		dotenv: true,
		envName: args.environment,
		globalRc: false,
		name: 'kysely',
		packageJson: false,
		rcFile: false,
	})

	consola.debug(loadedConfig)

	const { config, ...configMetadata } = loadedConfig

	return {
		...(config || {}),
		configMetadata,
		cwd,
		migrations: {
			getMigrationPrefix: getMillisPrefix,
			migrationFolder: 'migrations',
			...(config?.migrations || {}),
		},
		seeds: {
			getSeedPrefix: getMillisPrefix,
			seedFolder: 'seeds',
			...(config?.seeds || {}),
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
