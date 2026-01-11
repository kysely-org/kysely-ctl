import { copyFile, mkdir } from 'node:fs/promises'
import { consola } from 'consola'
import { join } from 'pathe'
import { CommonArgs } from '../../arguments/common.mjs'
import { assertExtension, ExtensionArg } from '../../arguments/extension.mjs'
import { createMigrationNameArg } from '../../arguments/migration-name.mjs'
import { getConfigOrFail } from '../../config/get-config.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineArgs } from '../../utils/define-args.mjs'
import { defineCommand } from '../../utils/define-command.mjs'
import { getTemplateExtension } from '../../utils/get-template-extension.mjs'

const args = defineArgs({
	...CommonArgs,
	...createMigrationNameArg(true),
	...ExtensionArg,
})

const Command = defineCommand(args, {
	meta: {
		description: 'Create a new migration file',
	},
	async run(context) {
		const { args } = context
		const { extension } = args

		const config = await getConfigOrFail(args)

		assertExtension(extension, config, 'migrations')

		const { getMigrationPrefix, migrationFolder } = config.migrations

		const wasMigrationsFolderCreated = Boolean(
			await mkdir(migrationFolder, { recursive: true }),
		)

		if (wasMigrationsFolderCreated) {
			consola.debug('Migrations folder created')
		}

		const filename = `${await getMigrationPrefix()}${
			args.migration_name
		}.${extension}`

		consola.debug('Filename:', filename)

		const filePath = join(migrationFolder, filename)

		consola.debug('File path:', filePath)

		const templateExtension = await getTemplateExtension(extension)

		const templatePath = join(
			__dirname,
			`templates/migration-template.${templateExtension}`,
		)

		consola.debug('Template path:', templatePath)

		await copyFile(templatePath, filePath)

		consola.success(`Created migration file at ${filePath}`)
	},
})

export const MakeCommand = createSubcommand('make', Command)
export const LegacyMakeCommand = createSubcommand('migrate:make', Command)
