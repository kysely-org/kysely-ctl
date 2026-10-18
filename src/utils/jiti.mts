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

	const jiti = createJiti(import.meta.url, jitiOptions)
	const importModule = jiti.import

	// Unwrap the extra default export from compiled CommonJS modules (unjs/jiti#468).
	jiti.import = async <T,>(...args: Parameters<typeof importModule>) => {
		const module = await importModule<T & { default?: T }>(...args)
		return args[1]?.default ? (module?.default ?? module) : module
	}

	return jiti
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
