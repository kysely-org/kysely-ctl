import { consola } from 'consola'
import { type ColumnUserConfig, table } from 'table'
import { isObject } from './is-object.mjs'

export function printTable(rows: unknown[]): void {
	const [row0] = rows

	if (!row0) {
		return
	}

	const valueTuples: unknown[][] = []

	for (const row of rows) {
		if (isObject(row)) {
			valueTuples.push(Object.values(row))
		}
	}

	const columns: ColumnUserConfig[] = []

	for (const value of Object.values(row0)) {
		columns.push({
			alignment:
				typeof value === 'number' || typeof value === 'bigint'
					? 'right'
					: 'left',
			wrapWord: true,
		})
	}

	consola.log(
		table([Object.keys(row0), ...valueTuples], {
			columns,
			drawVerticalLine: () => false,
			singleLine: true,
		}),
	)
}
