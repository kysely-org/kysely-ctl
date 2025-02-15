import { extname } from 'pathe'
import { isWindows, runtime } from 'std-env'
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

	if (extension === '.cts') {
		return await useTsRequire(path)
	}

	const pkgJSON = await getConsumerPackageJSON()

	if (pkgJSON.type === 'module') {
		return await useTsImport(path)
	}

	return await useTsRequire(path)
}

async function useTsImport(path: string): Promise<unknown> {
	const { tsImport } = await import('tsx/esm/api')

	const normalizedPath =
		isWindows && !path.startsWith('file://') ? `file://${path}` : path

	return await tsImport(normalizedPath, { parentURL: import.meta.url })
}

async function useTsRequire(path: string): Promise<unknown> {
	const { require: tsRequire } = await import('tsx/cjs/api')

	return await tsRequire(path, __filename)
}
