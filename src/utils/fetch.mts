import { destr } from 'destr'
import { isObject } from './is-object.mjs'

const RETRY_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504])
const JSON_CONTENT_TYPE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json$/i
const TEXT_CONTENT_TYPES = new Set([
	'image/svg',
	'application/xml',
	'application/xhtml',
	'application/html',
])

/** Fetch a URL with the response parsing and single GET retry used by ofetch. */
export async function fetchData<T>(url: string): Promise<T> {
	for (let attempt = 0; ; ++attempt) {
		let response: Response

		try {
			response = await fetch(url)
		} catch (cause) {
			if (attempt === 0 && !(isObject(cause) && cause.name === 'AbortError')) {
				continue
			}

			throw createFetchError(url, undefined, cause)
		}

		// Consume the body before retrying, and let body-read errors propagate.
		const data = await getResponseData(response)
		Object.assign(response, { _data: data })

		if (response.status >= 400 && response.status < 600) {
			if (attempt === 0 && RETRY_STATUS_CODES.has(response.status)) {
				continue
			}

			throw createFetchError(url, response)
		}

		return data as T
	}
}

async function getResponseData(response: Response): Promise<unknown> {
	if (!response.body) {
		return undefined
	}

	const contentType = response.headers.get('content-type')?.split(';')[0] || ''

	if (!contentType || JSON_CONTENT_TYPE.test(contentType)) {
		return destr(await response.text())
	}

	if (contentType === 'text/event-stream') {
		return response.body
	}

	if (contentType.startsWith('text/') || TEXT_CONTENT_TYPES.has(contentType)) {
		return await response.text()
	}

	return await response.blob()
}

function createFetchError(
	url: string,
	response?: Response & { _data?: unknown },
	cause?: unknown,
): Error {
	const detail = isObject(cause)
		? cause.message || String(cause)
		: String(cause ?? '')
	const status = response
		? `${response.status} ${response.statusText}`
		: '<no response>'
	const error = new Error(
		`[GET] ${JSON.stringify(url)}: ${status}${detail ? ` ${detail}` : ''}`,
		cause === undefined ? undefined : { cause },
	)
	error.name = 'FetchError'

	// Keep request/response diagnostics available to callers handling CLI errors.
	for (const [key, value] of Object.entries({
		request: url,
		options: { headers: new Headers() },
		response,
		data: response?._data,
		status: response?.status,
		statusCode: response?.status,
		statusText: response?.statusText,
		statusMessage: response?.statusText,
	})) {
		Object.defineProperty(error, key, { value })
	}

	return error
}
