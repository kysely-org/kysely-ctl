import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import type { ArgsDef, CommandDef } from 'citty'
import { consola } from 'consola'
import { join } from 'pathe'
import { CommonArgs } from '../../arguments/common.mjs'
import { ExtensionArg, assertExtension } from '../../arguments/extension.mjs'
import { getConfigOrFail } from '../../config/get-config.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import {
	getKyselyCodegenInstalledVersion,
	getPrismaKyselyInstalledVersion,
} from '../../utils/version.mjs'

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

		assertExtension(extension)

		const { seeds, ...config } = await getConfigOrFail(args)

		const seedsFolderPath = join(config.cwd, seeds.seedFolder)

		consola.debug('Seeds folder path:', seedsFolderPath)

		const wasSeedsFolderCreated = Boolean(
			await mkdir(seedsFolderPath, { recursive: true }),
		)

		if (wasSeedsFolderCreated) {
			consola.debug('Seeds folder created')
		}

		const destinationFilename = `${await seeds.getSeedPrefix()}${
			args.seed_name
		}.${extension}`

		consola.debug('Destination filename:', destinationFilename)

		const destinationFilePath = join(seedsFolderPath, destinationFilename)

		consola.debug('File path:', destinationFilePath)

		const databaseInterfacePath =
			seeds.databaseInterfacePath ||
			((await getKyselyCodegenInstalledVersion(args))
				? 'kysely-codegen'
				: undefined)

		consola.debug('Database interface path:', databaseInterfacePath)

		if (!databaseInterfacePath) {
			await copyFile(
				join(__dirname, 'templates/seed-template.ts'),
				destinationFilePath,
			)
		} else {
			const templateFile = await readFile(
				join(__dirname, 'templates/seed-type-safe-template.ts'),
				{ encoding: 'utf8' },
			)

			consola.debug('templateFile', templateFile)

			const [
				databaseInterfaceFilePath,
				databaseInterfaceName = databaseInterfaceFilePath ===
					'kysely-codegen' || (await getPrismaKyselyInstalledVersion(args))
					? 'DB'
					: 'Database',
			] = databaseInterfacePath.split('#')

			consola.debug('Database interface file path: ', databaseInterfaceFilePath)
			consola.debug('Database interface name: ', databaseInterfaceName)

			const populatedTemplateFile = templateFile
				.replace(/<typename>/g, databaseInterfaceName)
				.replace(/<path>/g, databaseInterfaceFilePath)

			consola.debug('Populated template file: ', populatedTemplateFile)

			await writeFile(destinationFilePath, populatedTemplateFile)
		}

		consola.success(`Created seed file at ${destinationFilePath}`)
	},
} satisfies CommandDef<typeof args>

export const MakeCommand = createSubcommand('make', BaseMakeCommand)
export const LegacyMakeCommand = createSubcommand('seed:make', BaseMakeCommand)
