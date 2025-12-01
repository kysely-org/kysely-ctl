import { describe, expect, it } from 'vitest'
import { getFileType } from '../src/utils/get-file-type.mjs'

const TS_EXTENSIONS = ['ts', 'mts', 'cts']
const JS_EXTENSIONS = ['js', 'mjs', 'cjs']
const ALL_EXTENSIONS = [...TS_EXTENSIONS, ...JS_EXTENSIONS]

describe('getFileType', () => {
	it.each(TS_EXTENSIONS)('should return "TS" for name.%s file', (extension) => {
		const result = getFileType(`file.${extension}`)

		expect(result).toEqual('TS')
	})

	it.each(JS_EXTENSIONS)('should return "JS" for name.%s file', (extension) => {
		const result = getFileType(`file.${extension}`)

		expect(result).toEqual('JS')
	})

	it.each(
		ALL_EXTENSIONS,
	)('should return "IRRELEVANT" for name.d.%s file', (extension) => {
		const result = getFileType(`file.d.${extension}`)

		expect(result).toEqual('IRRELEVANT')
	})

	it.each(TS_EXTENSIONS)('should return "TS" for d.%s file', (extension) => {
		const result = getFileType(`d.${extension}`)

		expect(result).toEqual('TS')
	})

	it.each(JS_EXTENSIONS)('should return "JS" for d.%s file', (extension) => {
		const result = getFileType(`d.${extension}`)

		expect(result).toEqual('JS')
	})

	it('should return "IRRELEVANT" for file without extension', () => {
		const result = getFileType('file')

		expect(result).toEqual('IRRELEVANT')
	})

	it('should return "IRRELEVANT" for file with less than 2 characters extension', () => {
		const result = getFileType('file.a')

		expect(result).toEqual('IRRELEVANT')
	})

	it.each(
		ALL_EXTENSIONS,
	)('should return "IRRELEVANT" for file with unrecognized .e%s extension', (extension) => {
		const result = getFileType(`file.e${extension}`)

		expect(result).toEqual('IRRELEVANT')
	})
})
