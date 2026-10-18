import { execFile } from 'node:child_process'
import {
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	symlink,
	writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { join, resolve } from 'pathe'
import { afterEach, describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)
const bin = resolve('dist/bin.mjs')
const index = pathToFileURL(resolve('dist/index.mjs')).href
const directories: string[] = []

afterEach(async () => {
	await Promise.all(
		directories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	)
})

describe.each([
	'provider',
	'factory',
	'migrator',
] as const)('migrate make with a custom %s', (mode) => {
	it.each([
		'file',
		'ts',
	] as const)('uses the %s provider folder for both aliases', async (kind) => {
		const fixture = await createFixture(mode, kind)

		await run(fixture, ['migrate', 'make', 'first'])
		await run(fixture, ['migrate:make', 'second'])

		expect(await readdir(join(fixture.cwd, 'custom/migrations'))).toEqual([
			'test_first.ts',
			'test_second.ts',
		])
		await expect(readdir(join(fixture.cwd, 'migrations'))).rejects.toThrow()

		const calls = (await readFile(fixture.log, 'utf8')).trim().split('\n')
		expect(calls.filter((call) => call === 'provider')).toHaveLength(2)
		expect(calls.filter((call) => call === 'db')).toHaveLength(
			mode === 'migrator' ? 2 : 0,
		)
		expect(calls.filter((call) => call === 'destroy')).toHaveLength(
			mode === 'migrator' ? 2 : 0,
		)
	})
})

it('creates a default migration without resolving the database', async () => {
	const fixture = await createFixture('default')

	await run(fixture, ['migrate', 'make', 'first'])

	expect(await readdir(join(fixture.cwd, 'migrations'))).toEqual([
		'test_first.ts',
	])
	await expect(readFile(fixture.log)).rejects.toThrow()
})

it('does not resolve migration providers when making a seed', async () => {
	const fixture = await createFixture('unused')

	await run(fixture, ['seed', 'make', 'first'])

	expect(await readdir(join(fixture.cwd, 'seeds'))).toEqual(['test_first.ts'])
	await expect(readFile(fixture.log)).rejects.toThrow()
})

async function createFixture(
	mode: 'provider' | 'factory' | 'migrator' | 'default' | 'unused',
	kind: 'file' | 'ts' = 'file',
) {
	const cwd = await mkdtemp(join(tmpdir(), 'kysely-ctl-migrate-make-'))
	directories.push(cwd)
	await symlink(resolve('node_modules'), join(cwd, 'node_modules'), 'junction')
	await mkdir(join(cwd, '.config'))
	const config = join(cwd, '.config/kysely.config.mts')
	const log = join(cwd, 'calls.log')
	const provider =
		kind === 'file'
			? "new FileMigrationProvider({ fs, path, migrationFolder: path.resolve('custom/migrations') })"
			: "new TSFileMigrationProvider({ migrationFolder: path.resolve('custom/migrations') })"
	const option = {
		provider: 'provider: createProvider()',
		factory: 'provider: async () => createProvider()',
		migrator:
			'migrator: async (db) => new Migrator({ db, provider: createProvider() })',
		default: '',
		unused:
			"provider: () => { throw new Error('The migration provider should not be resolved') }",
	}[mode]

	await writeFile(
		config,
		`
import { promises as fs, appendFileSync } from 'node:fs'
import path from 'node:path'
import { Kysely, SqliteDialect } from 'kysely'
import { FileMigrationProvider, Migrator } from 'kysely/migration'
import { TSFileMigrationProvider } from ${JSON.stringify(index)}
const log = ${JSON.stringify(log)}
const createProvider = () => { appendFileSync(log, 'provider\\n'); return ${provider} }
export default {
  kysely: () => {
    appendFileSync(log, 'db\\n')
    const db = new Kysely({ dialect: new SqliteDialect({ database: async () => {
      throw new Error('The database should not be connected')
    } }) })
    const destroy = db.destroy.bind(db)
    db.destroy = async () => { appendFileSync(log, 'destroy\\n'); await destroy() }
    return db
  },
  migrations: { getMigrationPrefix: () => 'test_', ${option} },
  seeds: { getSeedPrefix: () => 'test_' }
}
`,
	)

	return { cwd, config, log }
}

async function run(fixture: { cwd: string; config: string }, args: string[]) {
	return await execFileAsync(
		process.execPath,
		[bin, ...args, '-c', fixture.config],
		{
			cwd: fixture.cwd,
			timeout: 10000,
		},
	)
}
