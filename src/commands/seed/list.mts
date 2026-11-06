import { consola } from 'consola'
import { CommonArgs } from '../../arguments/common.mjs'
import { usingSeeder } from '../../seeds/using-seeder.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineCommand } from '../../utils/define-command.mjs'
import { printJSON } from '../../utils/json.mjs'

const Command = defineCommand(CommonArgs, {
	meta: {
		description: 'List seeds',
	},
	async run(context) {
		const seeds = await usingSeeder(context.args, (seeder) => seeder.getSeeds())

		consola.debug(seeds)

		if (!seeds.length) {
			consola.info('No seeds found.')
		} else {
			consola.info(`Found ${seeds.length} seed${seeds.length > 1 ? 's' : ''}:`)
		}

		for (const seed of seeds) {
			consola.log(seed.name)
		}

		if (context.args.json) {
			printJSON({
				status: 'success',
				seeds: seeds.map((seed) => ({ name: seed.name })),
			})
		}
	},
})

export const ListCommand = createSubcommand('list', Command)
