export function assertDefined<T>(
	thing: T,
): asserts thing is Exclude<T, undefined> {
	if (thing === undefined) {
		throw new Error('Expected value to be defined')
	}
}
