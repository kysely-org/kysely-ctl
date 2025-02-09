import { join } from 'pathe'
import type { CompilerOptions } from 'typescript'
import { getCWD } from '../config/get-cwd.mjs'
import { getTSConfig } from './tsconfig.mjs'

export async function getJitiAlias(): Promise<
	Record<string, string> | undefined
> {
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
