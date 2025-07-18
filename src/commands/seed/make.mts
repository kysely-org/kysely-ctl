import { copyFile, mkdir } from 'node:fs/promises'
import type { ArgsDef, CommandDef } from 'citty'
import { consola } from 'consola'
import { join } from 'pathe'
import { CommonArgs } from '../../arguments/common.mjs'
import { assertExtension, ExtensionArg } from '../../arguments/extension.mjs'
import { getConfigOrFail } from '../../config/get-config.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { getTemplateExtension } from '../../utils/get-template-extension.mjs'

const args = {
	...CommonArgs,
	...ExtensionArg,
	seed_name: {
		description: 'Seed file name to create',
		required: true,
		type: 'positional',
	},
} satisfies ArgsDef

const BaseMakeCommand = {
	meta: {
		description: 'Create a new seed file',
	},
	args,
	async run(context) {
		const { args } = context
		const { extension } = args

		consola.debug(context, [])

		const config = await getConfigOrFail(args)

		assertExtension(extension, config, 'seeds')

		const seedsFolderPath = join(config.cwd, config.seeds.seedFolder)

		consola.debug('Seeds folder path:', seedsFolderPath)

		const wasSeedsFolderCreated = Boolean(
			await mkdir(seedsFolderPath, { recursive: true }),
		)

		if (wasSeedsFolderCreated) {
			consola.debug('Seeds folder created')
		}

		const filename = `${await config.seeds.getSeedPrefix()}${
			args.seed_name
		}.${extension}`

		consola.debug('Filename:', filename)

		const filePath = join(seedsFolderPath, filename)

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
} satisfies CommandDef<typeof args>

export const MakeCommand = createSubcommand('make', BaseMakeCommand)
export const LegacyMakeCommand = createSubcommand('seed:make', BaseMakeCommand)
