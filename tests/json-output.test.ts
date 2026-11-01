import type { MigrationResultSet, Migrator } from 'kysely/migration'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { processMigrationResultSet } from '../src/kysely/process-migration-result-set.mjs'
import { isJSONOutput, runWithOutput } from '../src/utils/output.mjs'

const originalExitCode = process.exitCode

afterEach(() => {
	process.exitCode = originalExitCode
	vi.restoreAllMocks()
})

async function migrationOutput(resultSet: MigrationResultSet) {
	const write = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
	const migrator = { getMigrations: vi.fn() }
	await runWithOutput({ json: true }, () =>
		processMigrationResultSet(
			resultSet,
			'down',
			migrator as unknown as Migrator,
			true,
		),
	)
	expect(write).toHaveBeenCalledTimes(1)
	expect(migrator.getMigrations).not.toHaveBeenCalled()
	return JSON.parse(String(write.mock.calls[0]?.[0]))
}

describe('JSON output', () => {
	it('preserves rollback execution order', async () => {
		const output = await migrationOutput({
			results: [
				{ migrationName: '002_email', direction: 'Down', status: 'Success' },
				{ migrationName: '001_users', direction: 'Down', status: 'Success' },
			],
		})
		expect(output).toEqual({
			status: 'success',
			migrations: [
				{ name: '002_email', direction: 'down', status: 'success' },
				{ name: '001_users', direction: 'down', status: 'success' },
			],
		})
	})

	it('reports successful, failed and unexecuted migrations and exits unsuccessfully', async () => {
		const output = await migrationOutput({
			error: new Error('broken migration'),
			results: [
				{ migrationName: '001_users', direction: 'Up', status: 'Success' },
				{ migrationName: '002_email', direction: 'Up', status: 'Error' },
				{ migrationName: '003_index', direction: 'Up', status: 'NotExecuted' },
			],
		})
		expect(output).toEqual({
			status: 'error',
			error: { name: 'Error', message: 'broken migration' },
			migrations: [
				{ name: '001_users', direction: 'up', status: 'success' },
				{ name: '002_email', direction: 'up', status: 'error' },
				{ name: '003_index', direction: 'up', status: 'not_executed' },
			],
		})
		expect(process.exitCode).toBe(1)
	})

	it('reports a skipped operation with an empty migration array', async () => {
		expect(await migrationOutput({ results: [] })).toEqual({
			status: 'skipped',
			migrations: [],
		})
	})

	it('serializes thrown errors instead of losing their message', async () => {
		const write = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
		await runWithOutput({ json: true }, async () => {
			throw new TypeError('bad config')
		})
		expect(JSON.parse(String(write.mock.calls[0]?.[0]))).toEqual({
			status: 'error',
			error: { name: 'TypeError', message: 'bad config' },
		})
		expect(process.exitCode).toBe(1)
	})

	it('preserves thrown errors in text mode', async () => {
		const error = new Error('bad config')
		await expect(
			runWithOutput({ json: false }, async () => {
				throw error
			}),
		).rejects.toBe(error)
	})

	it.each([
		[['migrate', 'list', '--json'], true],
		[['seed', 'run', '--json', '--no-json'], false],
		[['sql', 'select 1', '--format=json'], true],
		[['sql', 'select 1', '-f', 'json'], true],
		[['sql', "select '--json'"], false],
		[['sql', 'select 1', '--format', 'csv'], false],
	] as const)('recognizes output flags in %j', (args, expected) => {
		expect(isJSONOutput([...args])).toBe(expected)
	})
})
