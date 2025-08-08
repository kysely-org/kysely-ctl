import type { Jiti, JitiOptions } from 'jiti'
import { join } from 'pathe'
import { runtime } from 'std-env'
import type { CompilerOptions } from 'typescript'
import { getTSConfig } from './tsconfig.mjs'

export interface GetJitiArgs {
	debug?: boolean
	experimentalResolveSvelteAliases?: boolean
	experimentalResolveTSConfigPaths?: boolean
	filesystemCaching?: boolean
}

export async function getJiti(args: GetJitiArgs): Promise<Jiti> {
	const jitiOptions = await getJitiOptions(args)

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
		const { filepath, tsconfig } = await getTSConfig()

		const { baseUrl, paths } = (tsconfig.compilerOptions ||
			{}) as CompilerOptions

		if (!paths) {
			return {}
		}

		const jitiAlias: Record<string, string> = {}

		for (const [alias, [path]] of Object.entries(paths)) {
			if (!path) {
				continue
			}

			jitiAlias[removeWildcards(alias)] = removeWildcards(
				join(filepath, baseUrl || '.', path),
			)
		}

		return jitiAlias
	} catch {
		return {}
	}
}

function removeWildcards(path: string): string {
	return path.replace(/(\/?\*\*?)+$/, '')
}
