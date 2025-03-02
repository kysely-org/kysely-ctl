import type { Jiti, JitiOptions } from 'jiti'
import { join } from 'pathe'
import { isDeno, runtime } from 'std-env'
import type { CompilerOptions } from 'typescript'
import { getCWD } from '../config/get-cwd.mjs'
import { getTSConfig } from './tsconfig.mjs'

export interface GetJitiArgs {
	debug?: boolean
	experimentalResolveTSConfigPaths?: boolean
	filesystemCaching?: boolean
}

export async function getJiti(args: GetJitiArgs): Promise<Jiti> {
	const jitiOptions = await getJitiOptions(args)

	const { createJiti } = await (isDeno ? import('jiti/native') : import('jiti'))

	return createJiti(import.meta.url, jitiOptions)
}

async function getJitiOptions(args: GetJitiArgs): Promise<JitiOptions> {
	return {
		alias: args.experimentalResolveTSConfigPaths
			? await getJitiAlias()
			: undefined,
		debug: Boolean(args.debug),
		fsCache: Boolean(args.filesystemCaching),
		tryNative: runtime !== 'node',
	}
}

async function getJitiAlias(): Promise<Record<string, string>> {
	const [jitiAliasFromTSConfig, jitiAliasFromDenoJSON] = await Promise.all([
		getJitiAliasFromTSConfig(),
		getJitiAliasFromDenoJSON(),
	])

	return {
		...jitiAliasFromDenoJSON,
		...jitiAliasFromTSConfig,
	}
}

async function getJitiAliasFromTSConfig(): Promise<Record<string, string>> {
	try {
		const tsconfig = await getTSConfig()

		const { baseUrl, paths } = (tsconfig.compilerOptions ||
			{}) as CompilerOptions

		if (!paths) {
			return {}
		}

		const cwd = getCWD()

		const jitiAlias: Record<string, string> = {}

		for (const [alias, [path]] of Object.entries(paths)) {
			if (!path) {
				continue
			}

			jitiAlias[removeWildcards(alias)] = removeWildcards(
				join(cwd, baseUrl || '.', path),
			)
		}

		return jitiAlias
	} catch (error) {
		return {}
	}
}

async function getJitiAliasFromDenoJSON(): Promise<Record<string, string>> {
	if (!isDeno) {
		return {}
	}

	return {
		'@db/sqlite': 'jsr:@db/sqlite@^0.12.0',
	}
}

function removeWildcards(path: string): string {
	return path.replace(/(\/?\*\*?)+$/, '')
}
