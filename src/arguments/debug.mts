import type { ArgsDef } from 'citty'

export const DebugArg = {
	debug: {
		default: false,
		description: 'Show debug information.',
		type: 'boolean',
	},
} satisfies ArgsDef
