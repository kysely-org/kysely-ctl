import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchData } from '../src/utils/fetch.mjs'

const URL = 'https://registry.npmjs.org/kysely-ctl'
const DATA = { 'dist-tags': { latest: '0.22.0' } }

afterEach(() => vi.unstubAllGlobals())

function mockFetch() {
	const mock = vi.fn<typeof fetch>()
	vi.stubGlobal('fetch', mock)
	return mock
}

describe('fetchData', () => {
	it.each(['application/json', 'application/vnd.npm+json; charset=utf-8', ''])(
		'parses JSON for content-type %s',
		async (contentType) => {
			const mock = mockFetch().mockResolvedValue(
				new Response(JSON.stringify(DATA), {
					headers: { 'content-type': contentType },
				}),
			)

			await expect(fetchData(URL)).resolves.toEqual(DATA)
			expect(mock).toHaveBeenCalledExactlyOnceWith(URL)
		},
	)

	it('keeps lenient JSON parsing', async () => {
		mockFetch().mockResolvedValue(
			new Response('invalid JSON', {
				headers: { 'content-type': 'application/json' },
			}),
		)

		await expect(fetchData(URL)).resolves.toBe('invalid JSON')
	})

	it('keeps prototype pollution protection when parsing JSON', async () => {
		mockFetch().mockResolvedValue(
			new Response('{"__proto__":{"polluted":true},"version":"0.22.0"}', {
				headers: { 'content-type': 'application/json' },
			}),
		)
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

		try {
			await expect(fetchData(URL)).resolves.toEqual({ version: '0.22.0' })
		} finally {
			warn.mockRestore()
		}
	})

	it.each(['text/plain', 'text/html', 'application/xml'])(
		'keeps %s responses as text',
		async (contentType) => {
			mockFetch().mockResolvedValue(
				new Response(JSON.stringify(DATA), {
					headers: { 'content-type': contentType },
				}),
			)

			await expect(fetchData(URL)).resolves.toBe(JSON.stringify(DATA))
		},
	)

	it('returns binary responses as blobs', async () => {
		mockFetch().mockResolvedValue(
			new Response('binary', {
				headers: { 'content-type': 'application/octet-stream' },
			}),
		)

		const result = await fetchData<Blob>(URL)
		expect(result).toBeInstanceOf(Blob)
		await expect(result.text()).resolves.toBe('binary')
	})

	it('returns event streams without consuming them', async () => {
		const response = new Response('data: hello\n\n', {
			headers: { 'content-type': 'text/event-stream' },
		})
		mockFetch().mockResolvedValue(response)

		await expect(fetchData(URL)).resolves.toBe(response.body)
		expect(response.bodyUsed).toBe(false)
	})

	it.each([204, 205, 304])('handles bodyless %s responses', async (status) => {
		mockFetch().mockResolvedValue(new Response(null, { status }))

		await expect(fetchData(URL)).resolves.toBeUndefined()
	})

	it.each([408, 409, 425, 429, 500, 502, 503, 504])(
		'retries HTTP %s once after consuming the response body',
		async (status) => {
			const response = Response.json({ error: 'try again' }, { status })
			const mock = mockFetch()
				.mockResolvedValueOnce(response)
				.mockImplementationOnce(async () => {
					expect(response.bodyUsed).toBe(true)
					return Response.json(DATA)
				})

			await expect(fetchData(URL)).resolves.toEqual(DATA)
			expect(mock).toHaveBeenCalledTimes(2)
		},
	)

	it.each([400, 401, 403, 404, 501])(
		'does not retry HTTP %s',
		async (status) => {
			const mock = mockFetch().mockResolvedValue(Response.json({}, { status }))

			await expect(fetchData(URL)).rejects.toMatchObject({ status })
			expect(mock).toHaveBeenCalledTimes(1)
		},
	)

	it('preserves HTTP error diagnostics after exhausting the retry', async () => {
		const data = { error: 'unavailable' }
		const mock = mockFetch().mockImplementation(async () =>
			Response.json(data, { status: 503, statusText: 'Service Unavailable' }),
		)

		await expect(fetchData(URL)).rejects.toMatchObject({
			name: 'FetchError',
			message: `[GET] "${URL}": 503 Service Unavailable`,
			request: URL,
			response: expect.any(Response),
			data,
			status: 503,
			statusCode: 503,
			statusText: 'Service Unavailable',
			statusMessage: 'Service Unavailable',
		})
		expect(mock).toHaveBeenCalledTimes(2)
	})

	it('retries a network failure once', async () => {
		const mock = mockFetch()
			.mockRejectedValueOnce(new TypeError('fetch failed'))
			.mockResolvedValueOnce(Response.json(DATA))

		await expect(fetchData(URL)).resolves.toEqual(DATA)
		expect(mock).toHaveBeenCalledTimes(2)
	})

	it('preserves the final network error as the cause', async () => {
		const cause = new TypeError('fetch failed')
		const mock = mockFetch().mockRejectedValue(cause)

		await expect(fetchData(URL)).rejects.toMatchObject({
			name: 'FetchError',
			message: `[GET] "${URL}": <no response> fetch failed`,
			cause,
		})
		expect(mock).toHaveBeenCalledTimes(2)
	})

	it('does not retry aborts', async () => {
		const cause = new DOMException('aborted', 'AbortError')
		const mock = mockFetch().mockRejectedValue(cause)

		await expect(fetchData(URL)).rejects.toMatchObject({ cause })
		expect(mock).toHaveBeenCalledTimes(1)
	})

	it('does not retry body-read failures, including HTTP error bodies', async () => {
		const cause = new Error('connection closed while reading body')
		const response = new Response(
			new ReadableStream({
				start(controller) {
					controller.error(cause)
				},
			}),
			{ status: 503, headers: { 'content-type': 'application/json' } },
		)
		const mock = mockFetch().mockResolvedValue(response)

		await expect(fetchData(URL)).rejects.toBe(cause)
		expect(mock).toHaveBeenCalledTimes(1)
	})
})
