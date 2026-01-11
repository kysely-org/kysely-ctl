import type { CommandDef, SubCommandsDef } from 'citty'

export function createSubcommand<
	Name extends string,
	// biome-ignore lint/suspicious/noExplicitAny: it's fune.
	const Command extends CommandDef<any>,
>(
	name: Name,
	def: Command,
): {
	readonly [K in Name]: Readonly<
		Omit<Command, 'meta'> & {
			meta: Omit<Command['meta'], 'name'> & { readonly name: Name }
		}
	>
} {
	return {
		[name]: { ...def, meta: { ...def.meta, name } },
	} satisfies SubCommandsDef as never
}
