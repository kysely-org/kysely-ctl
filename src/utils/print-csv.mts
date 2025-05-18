import { consola } from 'consola'

export function printCSV(rows: unknown[]): void {
	const [row0] = rows

	if (!row0) {
		return
	}

	consola.log(`"${Object.keys(row0).join('","')}"`)

	for (const row of rows) {
		const transformedValues = []
		for (const value of Object.values(row as object)) {
			transformedValues.push(typeof value === 'string' ? `"${value}"` : value)
		}

		consola.log(transformedValues.join(','))
	}
}
