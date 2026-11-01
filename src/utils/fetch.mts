const RETRY_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504])

export async function fetchJSON<T>(url: string): Promise<T> {
	for (let attempt = 0; ; ++attempt) {
		let response: Response

		try {
			response = await fetch(url)
		} catch (cause) {
			if (attempt === 0) {
				continue
			}

			throw cause
		}

		const data = await response.json()

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
