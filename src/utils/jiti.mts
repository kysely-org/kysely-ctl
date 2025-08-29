import { consola } from 'consola'
import type { Jiti, JitiOptions } from 'jiti'
import { dirname, resolve } from 'pathe'
import { runtime } from 'std-env'
import type { CompilerOptions } from 'typescript'
import { getTSConfigs, type TSConfigWithPath } from './tsconfig.mjs'

export interface GetJitiArgs {
	debug?: boolean
	experimentalResolveTSConfigPaths?: boolean
	filesystemCaching?: boolean
}

export async function getJiti(args: GetJitiArgs): Promise<Jiti> {
	const jitiOptions = await getJitiOptions(args)

	consola.debug('jitiOptions', jitiOptions)

	const { createJiti } = await import('jiti')

	return createJiti(import.meta.url, jitiOptions)
}

async function getJitiOptions(args: GetJitiArgs): Promise<JitiOptions> {
	return {
		alias: args.experimentalResolveTSConfigPaths
			? await getJitiAliasFromTSConfig()
			: undefined,
		debug: Boolean(args.debug),
		fsCache: Boolean(args.filesystemCaching),
		jsx: true,
		tryNative: runtime !== 'node',
	}
}

async function getJitiAliasFromTSConfig(): Promise<Record<string, string>> {
	try {
		const { configs, merged } = await getTSConfigs()

		if (!configs.length) {
			return {}
		}

		const { filepath, paths } = resolvePaths(configs) || {}

		consola.debug('filepath', filepath)
		consola.debug('paths', JSON.stringify(paths, null, 2))

		if (!paths) {
			return {}
		}

		const { baseUrl = '.' } = (merged?.compilerOptions || {}) as CompilerOptions
		// biome-ignore lint/style/noNonNullAssertion: paths != null => filepath != null
		const dirpath = dirname(filepath!)

		const jitiAlias: Record<string, string> = {}

		for (const [alias, [path]] of Object.entries(paths)) {
			if (!path) {
				continue
			}

			jitiAlias[removeWildcards(alias)] = removeWildcards(
				resolve(dirpath, baseUrl, path),
			)
		}

		return jitiAlias
	} catch {
		return {}
	}
}

function resolvePaths(results: TSConfigWithPath[]): {
	filepath: string
	paths: NonNullable<CompilerOptions['paths']>
} | null {
	for (const result of results) {
		const { filepath, tsconfig } = result
		const { paths } = (tsconfig.compilerOptions || {}) as CompilerOptions

		if (paths) {
			return {
				filepath,
				paths,
			}
		}
	}

	return null
}

const WILDCARDS_REGEX = /(\/\*{1,2}|\*)+$/

function removeWildcards(path: string): string {
	return path.replace(WILDCARDS_REGEX, '')
}
