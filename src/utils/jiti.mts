import { consola } from 'consola'
import type { Jiti, JitiOptions } from 'jiti'
import { runtime } from 'std-env'
import { getCWD } from '../config/get-cwd.mjs'

export interface GetJitiArgs {
	debug?: boolean
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
		debug: Boolean(args.debug),
		fsCache: Boolean(args.filesystemCaching),
		jsx: true,
		tryNative: runtime !== 'node',
		tsconfigPaths: getCWD(),
	}
}
