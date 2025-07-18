import type { PathLike } from 'node:fs'
import { mkdir, readdir } from 'node:fs/promises'

export async function safeReaddir(path: PathLike): Promise<string[]> {
	try {
		return await readdir(path)
	} catch {
		await mkdir(path)
		return await readdir(path)
	}
}
