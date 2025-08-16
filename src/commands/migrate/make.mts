import { copyFile, mkdir } from 'node:fs/promises'
import type { ArgsDef, CommandDef } from 'citty'
import { consola } from 'consola'
import { join } from 'pathe'
import { CommonArgs } from '../../arguments/common.mjs'
import { assertExtension, ExtensionArg } from '../../arguments/extension.mjs'
import { createMigrationNameArg } from '../../arguments/migration-name.mjs'
import { getConfigOrFail } from '../../config/get-config.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { getTemplateExtension } from '../../utils/get-template-extension.mjs'

const args = {
	...CommonArgs,
	...createMigrationNameArg(true),
	...ExtensionArg,
} satisfies ArgsDef

const BaseMakeCommand = {
	meta: {
		description: 'Create a new migration file',
	},
	args,
	async run(context) {
		const { args } = context
		const { extension } = args

		consola.debug(context, [])

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
} satisfies CommandDef<typeof args>

export const MakeCommand = createSubcommand('make', BaseMakeCommand)
export const LegacyMakeCommand = createSubcommand(
	'migrate:make',
	BaseMakeCommand,
)
