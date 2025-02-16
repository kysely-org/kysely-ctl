import { createInterface } from 'node:readline/promises'
import type { ArgsDef, CommandDef, SubCommandsDef } from 'citty'
import { consola } from 'consola'
import { colorize } from 'consola/utils'
import type { Kysely } from 'kysely'
import { isCI, process } from 'std-env'
import { CommonArgs } from '../arguments/common.mjs'
import { getConfigOrFail } from '../config/get-config.mjs'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'
import { executeQuery } from '../kysely/execute-query.mjs'
import { inferDialectName } from '../kysely/infer-dialect-name.mjs'
import { usingKysely } from '../kysely/using-kysely.mjs'
import { printCSV } from '../utils/print-csv.mjs'
import { printTable } from '../utils/print-table.mjs'

const args = {
	...CommonArgs,
	format: {
		alias: 'f',
		default: 'table',
		description: 'The format to output the result in.',
		required: false,
		type: 'string',
		valueHint: 'table | csv | json',
	},
	query: {
		description:
			'The SQL query to execute. When not provided, and not in CI, will open an interactive SQL shell.',
		required: isCI,
		type: 'positional',
	},
	stream: {
		alias: 's',
		default: false,
		description: 'Stream the result set.',
		required: false,
	},
} satisfies ArgsDef

export const SqlCommand = {
	sql: {
		meta: {
			name: 'sql',
			description: 'Execute SQL queries',
		},
		args,
		subCommands: {},
		async run(context) {
			const { args } = context
			const { format = 'table', query } = args

			consola.debug(context, [])

			assertQuery(query)
			assertFormat(format)

			const config = await getConfigOrFail(args)

			await usingKysely(config, async (kysely) => {
				if (query) {
					return await executeQueryAndPrint(query, { format, kysely })
				}

				await startInteractiveExecution(config, kysely, format)
			})
		},
	} satisfies CommandDef<typeof args>,
} satisfies SubCommandsDef

function assertQuery(thing: unknown): asserts thing is string {
	if (
		(!isCI && typeof thing !== 'string') ||
		(typeof thing === 'string' && thing.length > 0)
	) {
		return
	}

	throw new Error('Query must be a non-empty string!')
}

const FORMATS = ['table', 'csv', 'json'] as const
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
	query: string,
	props: {
		format: Format
		kysely: Kysely<unknown>
	},
): Promise<void> {
	const result = await executeQuery(query, { kysely: props.kysely })

	const { format } = props

	if (format === 'json') {
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

		if (format === 'csv') {
			return printCSV([summary])
		}

		return printTable([summary])
	}

	if (format === 'csv') {
		return printCSV(rows)
	}

	printTable(rows)
}

async function startInteractiveExecution(
	config: ResolvedKyselyCTLConfig,
	kysely: Kysely<unknown>,
	format: Format,
): Promise<void> {
	while (true) {
		let query = await consola.prompt(getPrompt(config, kysely), {
			cancel: 'null',
			placeholder: 'select 1',
			required: true,
			type: 'text',
		})

		if (isSafeword(query)) {
			return
		}

		if (query.endsWith('\\')) {
			const readline = createInterface({
				// biome-ignore lint/style/noNonNullAssertion: yolo
				input: process.stdin!,
				output: process.stdout,
			})

			do {
				const moreQuery = await readline.question('')

				query = `${query.replace(/\\*$/, '')} ${moreQuery}`
			} while (query.endsWith('\\'))

			readline.close()
		}

		try {
			await executeQueryAndPrint(query, { format, kysely })
		} catch (error) {
			consola.error(error instanceof Error ? error.message : error)
		}
	}
}

const SAFEWORDS = ['exit', 'quit', 'bye', ':q'] as const
type Safeword = (typeof SAFEWORDS)[number]

function isSafeword(thing: unknown): thing is null | Safeword {
	return typeof thing !== 'string' || SAFEWORDS.includes(thing as Safeword)
}

function getPrompt(
	config: ResolvedKyselyCTLConfig,
	kysely: Kysely<unknown>,
): string {
	const { dialect } = config

	return `${
		typeof dialect === 'string' ? dialect : inferDialectName(kysely)
	} ${colorize('cyan', '❯')}`
}
