import { copyFile, mkdir } from 'node:fs/promises'
import type { ArgsDef, CommandDef, SubCommandsDef } from 'citty'
import { consola } from 'consola'
import { join } from 'pathe'
import { CWDArg } from '../arguments/cwd.mjs'
import { DebugArg } from '../arguments/debug.mjs'
import { ExtensionArg, assertExtension } from '../arguments/extension.mjs'
import { NoOutdatedCheckArg } from '../arguments/no-outdated-notice.mjs'
import { configFileExists, getConfig } from '../config/get-config.mjs'
import { getTemplateExtension } from '../utils/get-template-extension.mjs'

const args = {
	...CWDArg,
	...DebugArg,
	...ExtensionArg,
	...NoOutdatedCheckArg,
} satisfies ArgsDef

export const InitCommand = {
	init: {
		meta: {
			name: 'init',
			description: 'Create a sample `kysely.config` file',
		},
		args,
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

			const configFolderPath = join(config.cwd, '.config')

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
	} satisfies CommandDef<typeof args>,
} satisfies SubCommandsDef
