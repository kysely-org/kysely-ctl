import { consola } from 'consola'
import { join } from 'pathe'
import type { TSConfig } from 'pkg-types'
import {
	parse,
	TSConfckCache,
	type TSConfckParseNativeResult,
	type TSConfckParseResult,
} from 'tsconfck'
import { getCWD } from '../config/get-cwd.mjs'

export interface TSConfigWithPath {
	filepath: string
	tsconfig: TSConfig
}

const cache = new TSConfckCache<
	TSConfckParseResult | TSConfckParseNativeResult
>()

export async function getTSConfigs(): Promise<{
	configs: TSConfigWithPath[]
	merged: TSConfig
}> {
	const { extended, tsconfig } = await parse(join(getCWD(), 'index.ts'), {
		cache,
	})

	consola.debug('extended', JSON.stringify(extended, null, 2))
	consola.debug('tsconfig', JSON.stringify(tsconfig, null, 2))

	return {
		configs:
			extended?.map((result) => ({
				filepath: result.tsconfigFile,
				tsconfig: result.tsconfig,
			})) || [],
		merged: tsconfig,
	}
}
