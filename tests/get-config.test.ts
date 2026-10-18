import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'pathe'
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript'
import { afterEach, describe, expect, it } from 'vitest'
import { getConfigOrFail } from '../src/config/get-config.mjs'

const CONFIG_SOURCE = `export default {
	kysely: () => ({}),
	migrations: { allowJS: true, migrationFolder: './custom-migrations' },
	seeds: { allowJS: true, seedFolder: './custom-seeds' },
}`

const directories: string[] = []

afterEach(async () => {
	await Promise.all(
		directories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true })),
	)
})

async function createConfigDirectory(): Promise<string> {
	const directory = await mkdtemp(join(tmpdir(), 'kysely-ctl-config-'))
	directories.push(directory)
	await writeFile(join(directory, 'package.json'), '{"type":"commonjs"}')
	return directory
}

function compileCommonJS(source: string): string {
	return transpileModule(source, {
		compilerOptions: {
			module: ModuleKind.CommonJS,
			target: ScriptTarget.ES2023,
		},
	}).outputText
}

describe('getConfig', () => {
	it.each([
		'ts',
		'mts',
		'cts',
		'mjs',
		'js',
		'cjs',
	])('should load a default export from a .%s config', async (extension) => {
		const directory = await createConfigDirectory()
		const configFile = join(directory, `kysely.config.${extension}`)
		await writeFile(
			configFile,
			['js', 'cjs'].includes(extension)
				? compileCommonJS(CONFIG_SOURCE)
				: CONFIG_SOURCE,
		)

		const config = await getConfigOrFail({ config: configFile })

		expect(config.kysely).toBeTypeOf('function')
		expect(config.migrations.allowJS).toBe(true)
		expect(config.migrations.migrationFolder).toBe(
			resolve(directory, 'custom-migrations'),
		)
		expect(config.seeds.allowJS).toBe(true)
		expect(config.seeds.seedFolder).toBe(resolve(directory, 'custom-seeds'))
	})

	it.each([
		'js',
		'cjs',
	])('should load module.exports from a .%s config', async (extension) => {
		const directory = await createConfigDirectory()
		const configFile = join(directory, `kysely.config.${extension}`)
		await writeFile(
			configFile,
			CONFIG_SOURCE.replace('export default', 'module.exports ='),
		)

		const config = await getConfigOrFail({ config: configFile })

		expect(config.kysely).toBeTypeOf('function')
		expect(config.migrations.migrationFolder).toBe(
			resolve(directory, 'custom-migrations'),
		)
	})

	it('should apply environment overrides and inheritance to compiled CommonJS configs', async () => {
		const directory = await createConfigDirectory()
		const configFile = join(directory, 'kysely.config.js')
		await writeFile(
			join(directory, 'base.config.cjs'),
			compileCommonJS(`export default {
				migrations: { allowJS: true },
				$env: { production: { seeds: { seedFolder: './production-seeds' } } },
			}`),
		)
		await writeFile(
			configFile,
			compileCommonJS(`export default {
				kysely: () => ({}),
				extends: './base.config.cjs',
				migrations: { migrationFolder: './base-migrations' },
				$env: { production: { migrations: { migrationFolder: './production-migrations' } } },
			}`),
		)

		const config = await getConfigOrFail({
			config: configFile,
			environment: 'production',
		})

		expect(config.kysely).toBeTypeOf('function')
		expect(config.migrations.allowJS).toBe(true)
		expect(config.migrations.migrationFolder).toBe(
			resolve(directory, 'production-migrations'),
		)
		expect(config.seeds.seedFolder).toBe(resolve(directory, 'production-seeds'))
	})
})
