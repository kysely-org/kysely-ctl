import { isObject } from './is-object.mjs'

const RETRY_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504])

/** Fetch JSON with a single GET retry. */
export async function fetchJSON<T>(url: string): Promise<T> {
	for (let attempt = 0; ; ++attempt) {
		let response: Response

		try {
			response = await fetch(url)
		} catch (cause) {
			if (attempt === 0 && !(isObject(cause) && cause.name === 'AbortError')) {
				continue
			}

			throw cause
		}

		// Consume the body before retrying, and let body-read errors propagate.
		const data = JSON.parse(await response.text())

		if (!response.ok) {
			if (attempt === 0 && RETRY_STATUS_CODES.has(response.status)) {
				continue
			}

			throw new Error(
				`Failed to fetch ${url}: ${response.status} ${response.statusText}`,
			)
		}

		return data as T
	}
}
