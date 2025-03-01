import { createJiti } from 'jiti'
import { extname } from 'pathe'
import { runtime } from 'std-env'
import { getConsumerPackageJSON } from './pkg-json.mjs'

export async function importTSFile(path: string): Promise<unknown> {
	// a runtime that supports importing TypeScript files
	if (runtime !== 'node') {
		return await import(path)
	}

	const jiti = createJiti(import.meta.url, { fsCache: false })

	const extension = extname(path)

	if (extension === '.mts') {
		return await jiti.import(path)
	}

	if (extension === '.cts') {
		return jiti(path)
	}

	const pkgJSON = await getConsumerPackageJSON()

	if (pkgJSON.type === 'module') {
		return await jiti.import(path)
	}

	return jiti(path)
}
