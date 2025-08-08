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

export async function getTSConfig(): Promise<TSConfigWithPath> {
	const { tsconfig, tsconfigFile } = await parse(join(getCWD(), 'index.ts'), {
		cache,
	})

	return { filepath: tsconfigFile, tsconfig }
}
