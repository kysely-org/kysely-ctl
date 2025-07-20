import type { ArgsDef } from 'citty'
import type { ResolvedKyselyCTLConfig } from '../config/kysely-ctl-config.mjs'

const TS_EXTENSIONS = ['ts', 'mts', 'cts'] as const
const JS_EXTENSIONS = ['js', 'mjs', 'cjs'] as const
const ALL_EXTENSIONS = [...TS_EXTENSIONS, ...JS_EXTENSIONS] as const

export const ExtensionArg = {
	extension: {
		alias: 'x',
		default: 'ts',
		description: 'The file extension to use.',
		type: 'string',
		valueHint: ALL_EXTENSIONS.map((extension) => `"${extension}"`).join(' | '),
	},
} satisfies ArgsDef

export type Extension = (typeof ALL_EXTENSIONS)[number]

export function assertExtension(thing: unknown): asserts thing is Extension
export function assertExtension(
	thing: unknown,
	config: ResolvedKyselyCTLConfig,
	context: 'migrations' | 'seeds',
): asserts thing is Extension

export function assertExtension(
	thing: unknown,
	config?: ResolvedKyselyCTLConfig,
	context?: 'migrations' | 'seeds',
): asserts thing is Extension {
	const allowJS = config?.[context || 'migrations'].allowJS ?? true

	if (
		!allowJS &&
		JS_EXTENSIONS.includes(thing as (typeof JS_EXTENSIONS)[number])
	) {
		throw new Error(
			`Invalid file extension "${thing}"! Expected ${TS_EXTENSIONS.map(
				(extension) => `"${extension}"`,
			).join(' | ')}. To use JS extensions, set "${context}.allowJS" to true.`,
		)
	}

	const extensions = allowJS ? ALL_EXTENSIONS : TS_EXTENSIONS

	if (!extensions.includes(thing as (typeof TS_EXTENSIONS)[number])) {
		throw new Error(
			`Invalid file extension "${thing}"! Expected ${ExtensionArg.extension.valueHint}`,
		)
	}
}
