import { copyFile, cp } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'pathe'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
	const distPath = resolve(__dirname, '../dist')

	await Promise.allSettled(
		['deno-json', 'package-json'].map(async (flavor) => {
			const exampleNodeModulesPath = resolve(
				__dirname,
				`../examples/deno-${flavor}/node_modules`,
			)

			await Promise.all([
				copyFile(
					join(distPath, 'bin.mjs'),
					join(exampleNodeModulesPath, '.bin/kysely'),
				),
				cp(distPath, resolve(exampleNodeModulesPath, 'kysely-ctl/dist'), {
					force: true,
					recursive: true,
				}),
			])
		}),
	)
}

main()
