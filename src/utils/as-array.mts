export function asArray<T>(
	thing: T,
): T extends readonly (infer I)[] ? I[] : T[] {
	// biome-ignore lint/suspicious/noExplicitAny: i know what i'm doing bro.
	return (Array.isArray(thing) ? thing : [thing]) as any
}
