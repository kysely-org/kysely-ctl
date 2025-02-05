import { type TSConfig, readTSConfig } from 'pkg-types'
import { getCWD } from '../config/get-cwd.mjs'

let tsconfig: TSConfig

export async function getTSConfig(): Promise<TSConfig> {
	return (tsconfig ||= await readTSConfig(undefined, {
		startingFrom: getCWD(),
	}))
}
