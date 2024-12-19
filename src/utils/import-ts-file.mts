import { extname } from 'pathe'
import { isWindows, process, runtime } from 'std-env'
import { getConsumerPackageJSON } from './pkg-json.mjs'

export async function importTSFile(path: string): Promise<unknown> {
	// a runtime that supports importing TypeScript files
	if (runtime !== 'node') {
		return await import(path)
	}

	const extension = extname(path)

	if (extension === '.mts') {
		return await useTsImport(path)
	}

	if (
		extension === '.cts' ||
		// getting the consumer's package JSON (in following lines) is probably slower than require(esm)'ing.
		isRequireESMEnabled()
	) {
		return await useTsRequire(path)
	}

	const pkgJSON = await getConsumerPackageJSON()

	if (pkgJSON.type === 'module') {
		return await useTsImport(path)
	}

	return await useTsRequire(path)
}

function isRequireESMEnabled(): boolean {
	return Boolean(process.features?.require_module)
}

async function useTsImport(path: string): Promise<unknown> {
	const { tsImport } = await import('tsx/esm/api')

	if (isWindows && !path.startsWith('file://')) {
		path = `file://${path}`
	}

	return await tsImport(path, { parentURL: import.meta.url })
}

async function useTsRequire(path: string): Promise<unknown> {
	const { require: tsRequire } = await import('tsx/cjs/api')

	return await tsRequire(path, __filename)
}
