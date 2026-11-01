import { consola } from 'consola'
import { CommonArgs } from '../../arguments/common.mjs'
import { OutputArgs } from '../../arguments/output.mjs'
import { usingSeeder } from '../../seeds/using-seeder.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineArgs } from '../../utils/define-args.mjs'
import { defineCommand } from '../../utils/define-command.mjs'
import { runWithOutput } from '../../utils/output.mjs'

const Command = defineCommand(defineArgs({ ...CommonArgs, ...OutputArgs }), {
	meta: {
		description: 'List seeds',
	},
	async run(context) {
		await runWithOutput(context.args, async () => {
			const seeds = await usingSeeder(context.args, (seeder) =>
				seeder.getSeeds(),
			)

			consola.debug(seeds)

			if (context.args.json) {
				return {
					status: 'success',
					seeds: seeds.map((seed) => ({ name: seed.name })),
				}
			}

			if (!seeds.length) {
				return consola.info('No seeds found.')
			}

			consola.info(`Found ${seeds.length} seed${seeds.length > 1 ? 's' : ''}:`)

			for (const seed of seeds) {
				consola.log(seed.name)
			}
		})
	},
})

export const ListCommand = createSubcommand('list', Command)
