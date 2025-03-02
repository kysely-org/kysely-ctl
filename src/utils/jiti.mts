import type { Jiti, JitiOptions } from 'jiti'
import { join } from 'pathe'
import { runtime } from 'std-env'
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

	const { createJiti } = await (runtime === 'node'
		? import('jiti')
		: import('jiti/native'))

	return createJiti(import.meta.url, jitiOptions)
}

async function getJitiOptions(args: GetJitiArgs): Promise<JitiOptions> {
	return {
		alias: args.experimentalResolveTSConfigPaths
			? await getJitiAlias()
			: undefined,
		debug: Boolean(args.debug),
		fsCache: Boolean(args.filesystemCaching),
		importMeta: import.meta,
	}
}

async function getJitiAlias(): Promise<Record<string, string> | undefined> {
	try {
		const tsconfig = await getTSConfig()

		const { baseUrl, paths } = (tsconfig.compilerOptions ||
			{}) as CompilerOptions

		if (!paths) {
			return
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

function removeWildcards(path: string): string {
	return path.replace(/(\/?\*\*?)+$/, '')
}
