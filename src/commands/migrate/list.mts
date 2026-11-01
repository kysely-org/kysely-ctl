import { consola } from 'consola'
import { process } from 'std-env'
import { CommonArgs } from '../../arguments/common.mjs'
import { getMigrations } from '../../kysely/get-migrations.mjs'
import { usingMigrator } from '../../kysely/using-migrator.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineArgs } from '../../utils/define-args.mjs'
import { defineCommand } from '../../utils/define-command.mjs'
import { exitWithError } from '../../utils/error.mjs'
import { runWithOutput, serializeError } from '../../utils/output.mjs'

const args = defineArgs({
	...CommonArgs,
	'fail-on-pending': {
		default: false,
		description: 'Fail if there are pending migrations',
		type: 'boolean',
	},
})

const Command = defineCommand(args, {
	meta: {
		description: 'List both completed and pending migrations',
	},
	async run(context) {
		await runWithOutput(context.args, async () => {
			const migrations = await usingMigrator(context.args, getMigrations)

			consola.debug(migrations)

			if (context.args.json) {
				const failed =
					context.args['fail-on-pending'] &&
					migrations.some((migration) => migration.executedAt == null)
				if (failed) {
					process.exitCode = 1
				}

				return {
					status: failed ? 'error' : 'success',
					migrations: migrations.map((migration) => ({
						name: migration.name,
						executedAt: migration.executedAt?.toISOString() ?? null,
						status: migration.executedAt ? 'executed' : 'pending',
					})),
					...(failed
						? { error: serializeError('Failed due to pending migrations.') }
						: {}),
				}
			}

			if (!migrations.length) {
				return consola.info('No migrations found.')
			}

			consola.info(
				`Found ${migrations.length} migration${migrations.length > 1 ? 's' : ''}:`,
			)

			for (const migration of migrations) {
				consola.log(`[${migration.executedAt ? '`✓`' : ' '}] ${migration.name}`)
			}

			if (!context.args['fail-on-pending']) {
				return
			}

			const hasPending = migrations.some(
				(migration) => migration.executedAt == null,
			)

			if (hasPending) {
				exitWithError('Failed due to pending migrations.')
			}
		})
	},
})

export const ListCommand = createSubcommand('list', Command)
export const LegacyListCommand = createSubcommand('migrate:list', Command)
