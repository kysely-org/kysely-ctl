export function isObject<T>(
	thing: T,
	// @ts-expect-error necessary evil to make downstream inference work nicely for `T=unknown` as well as something with an actual type.
): thing is unknown extends T
	? Record<string, unknown>
	: Exclude<Extract<T, object>, readonly unknown[]> {
	return typeof thing === 'object' && thing !== null && !Array.isArray(thing)
}
