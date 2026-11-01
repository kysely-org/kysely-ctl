import { consola } from 'consola'
import { colorize } from 'consola/utils'
import { process } from 'std-env'
import { CommonArgs } from '../../arguments/common.mjs'
import { OutputArgs } from '../../arguments/output.mjs'
import { usingSeeder } from '../../seeds/using-seeder.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineArgs } from '../../utils/define-args.mjs'
import { defineCommand } from '../../utils/define-command.mjs'
import { exitWithError } from '../../utils/error.mjs'
import { runWithOutput, serializeError } from '../../utils/output.mjs'

const args = defineArgs({
	...CommonArgs,
	...OutputArgs,
	specific: {
		description: 'Run seed file/s with given name/s',
		type: 'string',
	},
})

const Command = defineCommand(args, {
	meta: {
		description: 'Run seed files',
	},
	async run(context) {
		const { args } = context
		await runWithOutput(args, async () => {
			const { specific } = args

			consola.start('Starting seed run')

			const resultSet = await usingSeeder(args, (seeder) =>
				seeder.run(specific),
			)

			consola.debug(resultSet)

			const { error, results } = resultSet

			if (args.json) {
				if (error) {
					process.exitCode = 1
				}

				return {
					status: error ? 'error' : results.length ? 'success' : 'skipped',
					seeds: results.map((result) => ({
						name: result.seedName,
						status: {
							Success: 'success',
							Error: 'error',
							NotExecuted: 'not_executed',
						}[result.status],
					})),
					...(error ? { error: serializeError(error) } : {}),
				}
			}

			if (!results.length) {
				return consola.info('No seeds found.')
			}

			if (!error) {
				consola.success('Seed successful')
			}

			const actuallyRan = error
				? results.filter((result) => result.status !== 'NotExecuted')
				: results

			consola.info(
				`Ran ${actuallyRan.length} seed${actuallyRan.length > 1 ? 's' : ''}:`,
			)

			for (const result of results) {
				consola.log(
					`[${
						{
							Error: colorize('red', '✗'),
							NotExecuted: ' ',
							Success: colorize('green', '✓'),
						}[result.status]
					}] ${result.seedName}${
						error && result.status === 'Error' ? ` - ${error}` : ''
					}`,
				)
			}

			if (error) {
				exitWithError(error)
			}
		})
	},
})

export const RunCommand = createSubcommand('run', Command)
export const LegacyRunCommand = createSubcommand('seed:run', Command)
