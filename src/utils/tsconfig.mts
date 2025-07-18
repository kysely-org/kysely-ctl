import { readTSConfig, type TSConfig } from 'pkg-types'
import { getCWD } from '../config/get-cwd.mjs'

let tsconfig: TSConfig

export async function getTSConfig(): Promise<TSConfig> {
	return (tsconfig ||= await readTSConfig(undefined, {
		from: getCWD(),
	}))
}
