import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import type { ArgsDef, CommandDef } from 'citty'
import { consola } from 'consola'
import { join } from 'pathe'
import { CommonArgs } from '../../arguments/common.mjs'
import { ExtensionArg, assertExtension } from '../../arguments/extension.mjs'
import { getConfigOrFail } from '../../config/get-config.mjs'
import type { HasCWD } from '../../config/get-cwd.mjs'
import type {
	DatabaseInterface,
	DatabaseInterfaceConfig,
} from '../../config/kysely-ctl-config.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { getKyselyCodegenInstalledVersion } from '../../utils/version.mjs'

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

		const databaseInterfaceConfig = await resolveDatabaseInterfaceConfig(
			args,
			seeds.databaseInterface,
		)
		consola.debug('Database interface config:', databaseInterfaceConfig)

		if (!databaseInterfaceConfig) {
			consola.debug('using non-type-safe seed template')

			await copyFile(
				join(__dirname, 'templates/seed-template.ts'),
				destinationFilePath,
			)

			return printSuccess(destinationFilePath)
		}

		consola.debug('using type-safe seed template')

		const templateFile = await readFile(
			join(__dirname, 'templates/seed-type-safe-template.ts'),
			{ encoding: 'utf8' },
		)
		consola.debug('Template file:', templateFile)

		const databaseInterfaceName = databaseInterfaceConfig.name || 'DB'

		const populatedTemplateFile = templateFile
			.replace(
				/<import>/,
				`import type ${
					databaseInterfaceConfig.isDefaultExport
						? databaseInterfaceName
						: `{ ${databaseInterfaceName} }`
				} from '${databaseInterfaceConfig.path}'`,
			)
			.replace(/<name>/, databaseInterfaceName)
		consola.debug('Populated template file: ', populatedTemplateFile)

		await writeFile(destinationFilePath, populatedTemplateFile)

		printSuccess(destinationFilePath)
	},
} satisfies CommandDef<typeof args>

function printSuccess(destinationFilePath: string): void {
	consola.success(`Created seed file at ${destinationFilePath}`)
}

async function resolveDatabaseInterfaceConfig(
	args: HasCWD,
	databaseInterface: DatabaseInterface | undefined,
): Promise<DatabaseInterfaceConfig | null> {
	if (databaseInterface === 'off') {
		return null
	}

	if (typeof databaseInterface === 'object') {
		return databaseInterface
	}

	if (await getKyselyCodegenInstalledVersion(args)) {
		return {
			isDefaultExport: false,
			name: 'DB',
			path: 'kysely-codegen',
		}
	}

	// if (await getPrismaKyselyInstalledVersion(config)) {
	// TODO: generates by default to ./prisma/generated/types.ts#DB
	//       but configurable at the kysely generator config level located in ./prisma/schema.prisma
	// }

	// if (await getKanelKyselyInstalledVersion(config)) {
	// TODO: generates by default to
	// }

	return null
}

export const MakeCommand = createSubcommand('make', BaseMakeCommand)
export const LegacyMakeCommand = createSubcommand('seed:make', BaseMakeCommand)
