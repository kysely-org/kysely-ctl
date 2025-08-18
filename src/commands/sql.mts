import { createInterface } from 'node:readline/promises'
import type { ParsedArgs } from 'citty'
import { consola } from 'consola'
import { colorize } from 'consola/utils'
import { isCI, process } from 'std-env'
import { CommonArgs } from '../arguments/common.mjs'
import { getConfigOrFail } from '../config/get-config.mjs'
import type { ResolvedKyselyCTLConfigWithKyselyInstance } from '../config/kysely-ctl-config.mjs'
import { executeQuery } from '../kysely/execute-query.mjs'
import { inferDialectName } from '../kysely/infer-dialect-name.mjs'
import { usingKysely } from '../kysely/using-kysely.mjs'
import { createSubcommand } from '../utils/create-subcommand.mjs'
import { defineArgs } from '../utils/define-args.mjs'
import { defineCommand } from '../utils/define-command.mjs'
import { printCSV } from '../utils/print-csv.mjs'

const args = defineArgs({
	...CommonArgs,
	format: {
		alias: 'f',
		default: 'csv',
		description: 'The format to output the result in.',
		required: false,
		type: 'string',
		valueHint: 'csv | json',
	},
	query: {
		description:
			'The SQL query to execute. When not provided, and not in CI, will open an interactive SQL shell.',
		required: isCI,
		type: 'positional',
	},
})

const Command = defineCommand(args, {
	meta: {
		name: 'sql',
		description: 'Execute SQL queries',
	},
	subCommands: {},
	async run(context) {
		const { args } = context
		const { format, query } = args

		consola.debug(context, [])

		assertQuery(query)
		assertFormat(format)

		const config = await getConfigOrFail(args)

		await usingKysely(config, async (kysely) => {
			const hydratedConfig = { ...config, kysely }

			if (query) {
				return await executeQueryAndPrint(args, hydratedConfig)
			}

			await startInteractiveExecution(args, hydratedConfig)
		})
	},
})

export const SqlCommand = createSubcommand('sql', Command)

function assertQuery(thing: unknown): asserts thing is string {
	if (
		(!isCI && typeof thing !== 'string') ||
		(typeof thing === 'string' && thing.length > 0)
	) {
		return
	}

	throw new Error('Query must be a non-empty string!')
}

const FORMATS = ['csv', 'json'] as const
type Format = (typeof FORMATS)[number]

function assertFormat(thing: unknown): asserts thing is Format {
	if (thing == null || FORMATS.includes(thing as Format)) {
		return
	}

	throw new Error(
		`Invalid format "${thing}"! Expected ${FORMATS.map(
			(format) => `"${format}"`,
		).join(' | ')}`,
	)
}

async function executeQueryAndPrint(
	argz: ParsedArgs<typeof args>,
	config: ResolvedKyselyCTLConfigWithKyselyInstance,
): Promise<void> {
	const result = await executeQuery({ sql: argz.query }, config)

	if (argz.format === 'json') {
		return consola.log(JSON.stringify(result, null, 2))
	}

	const { insertId, numAffectedRows, numChangedRows, rows } = result
	const [row0] = rows

	// write without result set or DDL.
	if (
		!row0 &&
		(insertId != null || numAffectedRows != null || numChangedRows != null)
	) {
		const summary = {
			'Affected Rows': numAffectedRows,
			'Changed Rows': numChangedRows,
			'Insert ID': insertId,
			rowCount: rows.length,
		}

		return printCSV([summary])
	}

	return printCSV(rows)
}

async function startInteractiveExecution(
	argz: ParsedArgs<typeof args>,
	config: ResolvedKyselyCTLConfigWithKyselyInstance,
): Promise<void> {
	while (true) {
		let query = await consola.prompt(getPrompt(argz, config), {
			cancel: 'null',
			placeholder: 'select 1;',
			required: true,
			type: 'text',
		})

		if (query == null) {
			return
		}

		query = query.trim()

		if (isSafeword(query)) {
			return
		}

		if (!query.endsWith(';')) {
			const readline = createInterface({
				// biome-ignore lint/style/noNonNullAssertion: yolo
				input: process.stdin!,
				output: process.stdout,
			})

			do {
				const moreQuery = await readline.question('')

				query += ` ${moreQuery.trim()}`
			} while (!query.endsWith(';'))

			readline.close()
		}

		try {
			await executeQueryAndPrint({ ...argz, query }, config)
		} catch (error) {
			consola.error(error instanceof Error ? error.message : error)
		}
	}
}

const SAFEWORDS = ['exit', 'quit', 'bye', ':q'] as const
type Safeword = (typeof SAFEWORDS)[number]

function isSafeword(thing: unknown): thing is null | Safeword {
	return SAFEWORDS.includes(thing as Safeword)
}

function getPrompt(
	argz: ParsedArgs<typeof args>,
	config: ResolvedKyselyCTLConfigWithKyselyInstance,
): string {
	const { environment } = argz
	const { dialect } = config

	return [
		typeof dialect === 'string' ? dialect : inferDialectName(config.kysely),
		environment ? colorize('gray', `(${environment})`) : null,
		colorize('cyan', '❯'),
	]
		.filter(Boolean)
		.join(' ')
}
