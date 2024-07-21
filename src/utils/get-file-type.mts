export function getFileType(path: string) {
	let extension = ''
	const lastIndex = path.length - 1
	let i = 0

	for (; i < 3; i++) {
		const char = path.charAt(lastIndex - i)

		if (char === '.') {
			break
		}

		extension = `${char}${extension}`
	}

	if (
		extension.length < 2 ||
		path.charAt(lastIndex - i) !== '.' ||
		(path.charAt(lastIndex - (i + 1)) === 'd' &&
			path.charAt(lastIndex - (i + 2)) === '.')
	) {
		return 'IRRELEVANT'
	}

	if (['ts', 'mts', 'cts'].includes(extension)) {
		return 'TS'
	}

	if (['js', 'mjs', 'cjs'].includes(extension)) {
		return 'JS'
	}

	return 'IRRELEVANT'
}
