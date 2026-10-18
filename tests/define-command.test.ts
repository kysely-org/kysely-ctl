import { runCommand } from 'citty'
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from 'vitest'
import { CommonArgs } from '../src/arguments/common.mjs'

describe('defineCommand', () => {
	let log: MockInstance

	beforeEach(() => {
		vi.resetModules()
		log = vi.spyOn(console, 'log').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it.each([
		{ rawArgs: ['migrate:list'] },
		{ rawArgs: ['-c', 'src/db/kysely.config.ts', 'migrate:list'] },
		{ rawArgs: ['--config', 'src/db/kysely.config.ts', 'migrate:list'] },
		{ rawArgs: ['--config=src/db/kysely.config.ts', 'migrate:list'] },
		{ rawArgs: ['migrate:list', '-c', 'src/db/kysely.config.ts'] },
		{ rawArgs: ['--cwd', '/workspace', 'migrate:list'] },
		{ rawArgs: ['-e', 'test', 'migrate:list'] },
		{ rawArgs: ['migrate', 'list'] },
		{ rawArgs: ['-c', 'src/db/kysely.config.ts', 'migrate', 'list'] },
		{ rawArgs: ['migrate', '-c', 'src/db/kysely.config.ts', 'list'] },
		{ rawArgs: ['migrate', 'list', '-c', 'src/db/kysely.config.ts'] },
	])('should run $rawArgs without printing usage', async ({ rawArgs }) => {
		const { command, run } = await createCommand()

		await runCommand(command, { rawArgs })

		expect(run).toHaveBeenCalledOnce()
		expect(log).not.toHaveBeenCalled()
	})

	it.each([
		{ rawArgs: [] },
		{ rawArgs: ['migrate'] },
		{ rawArgs: ['-c', 'src/db/kysely.config.ts'] },
		{ rawArgs: ['-c', 'migrate:list'] },
	])('should print usage when $rawArgs selects no subcommand', async ({
		rawArgs,
	}) => {
		const { command, run } = await createCommand()

		await runCommand(command, { rawArgs })

		expect(run).not.toHaveBeenCalled()
		expect(log).toHaveBeenCalledExactlyOnceWith(
			expect.stringContaining('USAGE'),
		)
	})
})

async function createCommand() {
	const { defineCommand } = await import('../src/utils/define-command.mjs')
	const run = vi.fn()
	const list = defineCommand(CommonArgs, { run })
	const command = defineCommand(CommonArgs, {
		meta: { name: 'kysely' },
		subCommands: {
			'migrate:list': list,
			migrate: defineCommand(CommonArgs, {
				meta: { name: 'migrate' },
				subCommands: { list },
			}),
		},
	})

	return { command, run }
}
