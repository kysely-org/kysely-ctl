import type { ArgDef, PositionalArgDef } from 'citty'

export type StrictArgsDef = Record<string, StrictArgDef>

export type StrictArgDef = ArgDef & {
	description: NonNullable<ArgDef['description']>
	type: NonNullable<ArgDef['type']>
}

export function defineArgs<const Args extends StrictArgsDef>(
	args: Args,
	dontSort?: boolean,
): Args {
	return dontSort ? args : (sortArgs(args) as Args)
}

function sortArgs(args: StrictArgsDef): StrictArgsDef {
	return Object.fromEntries(
		Object.entries(args).sort(([nameA, argA], [nameB, argB]) => {
			const aliasA = getAlias(argA)
			const aliasB = getAlias(argB)

			if (aliasA) {
				nameA = aliasA
			}

			if (aliasB) {
				nameB = aliasB
			}

			return nameA.localeCompare(nameB)
		}),
	)
}

function getAlias(arg: StrictArgDef): string | null {
	const { alias } = arg as Exclude<ArgDef, PositionalArgDef>

	if (!alias) {
		return null
	}

	if (Array.isArray(alias)) {
		return alias.at(0) || null
	}

	return alias
}
