import type { Factory, OrFactory } from '../config/kysely-ctl-config.mjs'

export async function hydrate<
	// biome-ignore lint/suspicious/noExplicitAny: it's fine.
	F extends OrFactory<any, any[]> | undefined,
	// biome-ignore lint/suspicious/noExplicitAny: it's fine.
	P extends F extends OrFactory<any, infer A> | undefined ? A : never,
>(
	factory: F,
	parameters: P,
	defaultValue?: () => F extends OrFactory<infer T> ? T : never,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<Awaited<ReturnType<Extract<F, Factory<any>>>>> {
	if (factory == null) {
		return (defaultValue?.() ?? factory) as never
	}

	if (typeof factory !== 'function') {
		return factory as never
	}

	return await factory(...parameters)
}
