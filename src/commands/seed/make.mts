import { copyFile, mkdir } from 'node:fs/promises'
import { consola } from 'consola'
import { join } from 'pathe'
import { CommonArgs } from '../../arguments/common.mjs'
import { assertExtension, ExtensionArg } from '../../arguments/extension.mjs'
import { getConfigOrFail } from '../../config/get-config.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineArgs } from '../../utils/define-args.mjs'
import { defineCommand } from '../../utils/define-command.mjs'
import { getTemplateExtension } from '../../utils/get-template-extension.mjs'

const args = defineArgs({
	...CommonArgs,
	...ExtensionArg,
	seed_name: {
		description: 'Seed file name to create',
		required: true,
		type: 'positional',
	},
})

const Command = defineCommand(args, {
	meta: {
		description: 'Create a new seed file',
	},
	async run(context) {
		const { args } = context
		const { extension } = args

		const config = await getConfigOrFail(args)

		assertExtension(extension, config, 'seeds')

		const { getSeedPrefix, seedFolder } = config.seeds

		const wasSeedsFolderCreated = Boolean(
			await mkdir(seedFolder, { recursive: true }),
		)

		if (wasSeedsFolderCreated) {
			consola.debug('Seeds folder created')
		}

		const filename = `${await getSeedPrefix()}${args.seed_name}.${extension}`

		consola.debug('Filename:', filename)

		const filePath = join(seedFolder, filename)

		consola.debug('File path:', filePath)

		const templateExtension = await getTemplateExtension(extension)

		const templatePath = join(
			__dirname,
			`templates/seed-template.${templateExtension}`,
		)

		consola.debug('Template path:', templatePath)

		await copyFile(templatePath, filePath)

		consola.success(`Created seed file at ${filePath}`)
	},
})

export const MakeCommand = createSubcommand('make', Command)
export const LegacyMakeCommand = createSubcommand('seed:make', Command)
