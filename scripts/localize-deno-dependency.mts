import { copyFile, cp } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
	await copyFile(
		resolve(__dirname, '../dist/bin.js'),
		resolve(
			__dirname,
			'../examples/deno-package-json/node_modules/.bin/kysely',
		),
	)

	await cp(
		resolve(__dirname, '../dist'),
		resolve(
			__dirname,
			'../examples/deno-package-json/node_modules/kysely-ctl/dist',
		),
		{
			force: true,
			recursive: true,
		},
	)
}

main()
