import { extname } from 'pathe'
import { runtime } from 'std-env'
import { type GetJitiArgs, getJiti } from './jiti.mjs'
import { getConsumerPackageJSON } from './pkg-json.mjs'

export async function importTSFile(
	path: string,
	args: GetJitiArgs,
): Promise<unknown> {
	// a runtime that supports importing TypeScript files
	if (runtime !== 'node') {
		return await import(path)
	}

	const jiti = await getJiti(args)

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
