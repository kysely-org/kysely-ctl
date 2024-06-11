import { copyFile, mkdir } from 'node:fs/promises'
import type { ArgsDef, CommandDef } from 'citty'
import { join } from 'pathe'
import { consola } from 'consola'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { createMigrationNameArg } from '../../arguments/migration-name.mjs'
import { getConfigOrFail } from '../../config/get-config.mjs'
import { CommonArgs } from '../../arguments/common.mjs'
import { ExtensionArg, assertExtension } from '../../arguments/extension.mjs'

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

		assertExtension(extension)

		const config = await getConfigOrFail(args)

		const migrationsFolderPath = join(
			config.cwd,
			config.migrations.migrationFolder,
		)

		consola.debug('Migrations folder path:', migrationsFolderPath)

		const wasMigrationsFolderCreated = Boolean(
			await mkdir(migrationsFolderPath, { recursive: true }),
		)

		if (wasMigrationsFolderCreated) {
			consola.debug('Migrations folder created')
		}

		const filename = `${await config.migrations.getMigrationPrefix()}${
			args.migration_name
		}.${extension}`

		consola.debug('Filename:', filename)

		const filePath = join(migrationsFolderPath, filename)

		consola.debug('File path:', filePath)

		await copyFile(join(__dirname, 'templates/migration-template.ts'), filePath)

		consola.success(`Created migration file at ${filePath}`)
	},
} satisfies CommandDef<typeof args>

export const MakeCommand = createSubcommand('make', BaseMakeCommand)
export const LegacyMakeCommand = createSubcommand(
	'migrate:make',
	BaseMakeCommand,
)
