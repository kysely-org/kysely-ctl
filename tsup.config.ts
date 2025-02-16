import { cp, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig } from 'tsup'

export default defineConfig({
	clean: true,
	dts: true,
	entry: ['./src/index.mts', './src/bin.mts'],
	format: ['cjs', 'esm'],
	async onSuccess() {
		const distPath = join(__dirname, 'dist')

		// `publicDir` is not working on re-builds in `watch` mode.
		await cp(join(__dirname, 'src/templates'), join(distPath, 'templates'), {
			recursive: true,
		})

		const distFolder = await readdir(distPath, { withFileTypes: true })

		for (const dirent of distFolder) {
			const { name } = dirent

			const filePath = join(distPath, name)

			if (dirent.isFile() && name.endsWith('.js')) {
				const file = await readFile(filePath, {
					encoding: 'utf-8',
				})

				await writeFile(
					filePath,
					// esm output imports node built-in modules without `node:` specifiers,
					// which fails in Deno.
					file.replace(
						/"(fs|fs\/promises|path|url|child_process)"/g,
						'"node:$1"',
					),
				)
			}
		}
	},
	shims: true,
})
