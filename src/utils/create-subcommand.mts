import type { CommandDef, SubCommandsDef } from 'citty'

export function createSubcommand<
	Name extends string,
	Command extends { meta: CommandDef['meta'] },
>(name: Name, def: Command): { [K in Name]: Command } {
	return {
		[name]: {
			...def,
			meta: {
				...def.meta,
				name,
			},
		},
	} satisfies SubCommandsDef as any
}
