import { copyFile, mkdir } from 'node:fs/promises'
import { consola } from 'consola'
import { join } from 'pathe'
import { CWDArg } from '../arguments/cwd.mjs'
import { DebugArg } from '../arguments/debug.mjs'
import { assertExtension, ExtensionArg } from '../arguments/extension.mjs'
import { NoOutdatedCheckArg } from '../arguments/no-outdated-check.mjs'
import { configFileExists, getConfig } from '../config/get-config.mjs'
import { getCWD } from '../config/get-cwd.mjs'
import { createSubcommand } from '../utils/create-subcommand.mjs'
import { defineArgs } from '../utils/define-args.mjs'
import { defineCommand } from '../utils/define-command.mjs'
import { getTemplateExtension } from '../utils/get-template-extension.mjs'

const args = defineArgs({
	...CWDArg,
	...DebugArg,
	...ExtensionArg,
	...NoOutdatedCheckArg,
})

const Command = defineCommand(args, {
	meta: {
		description: 'Create a sample `kysely.config` file',
	},
	async run(context) {
		const { args } = context
		const { extension } = args

		consola.debug(context, [])

		const config = await getConfig(args)

		if (configFileExists(config)) {
			return consola.warn(
				`Init skipped: config file already exists at ${config.configMetadata.configFile}`,
			)
		}

		assertExtension(extension)

		const configFolderPath = join(getCWD(), '.config')

		consola.debug('Config folder path:', configFolderPath)

		const wasConfigFolderCreated = Boolean(
			await mkdir(configFolderPath, { recursive: true }),
		)

		if (wasConfigFolderCreated) {
			consola.debug('Config folder created')
		}

		const filePath = join(configFolderPath, `kysely.config.${extension}`)

		consola.debug('File path:', filePath)

		const templateExtension = await getTemplateExtension(extension)

		const templatePath = join(
			__dirname,
			`templates/config-template.${templateExtension}`,
		)

		consola.debug('Template path:', templatePath)

		await copyFile(templatePath, filePath)

		consola.success(`Config file created at ${filePath}`)
	},
})

export const InitCommand = createSubcommand('init', Command)
