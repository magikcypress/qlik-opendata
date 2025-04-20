export function loadQlikScript(tenantUrl, qlikClientId, redirectUrl) {
	if (
		!document.querySelector(
			'script[src="https://cdn.jsdelivr.net/npm/@qlik/embed-web-components"]',
		)
	) {
		const script = document.createElement('script')
		script.crossOrigin = 'anonymous'
		script.type = 'application/javascript'
		script.src = 'https://cdn.jsdelivr.net/npm/@qlik/embed-web-components'
		script.setAttribute('data-host', tenantUrl)
		script.setAttribute('data-client-id', qlikClientId)
		script.setAttribute('data-redirect-uri', redirectUrl)
		script.setAttribute('data-access-token-storage', 'session')
		script.setAttribute('data-cross-site-cookies', 'true')
		script.setAttribute('data-auto-redirect', 'true')

		document.body.appendChild(script)
	}
}

export function loadQlikScriptAnon(
	tenantUrl,
	qlikClientId,
	qlikEmbedAccessCode,
) {
	if (
		!document.querySelector(
			'script[src="https://cdn.jsdelivr.net/npm/@qlik/embed-web-components"]',
		)
	) {
		const script = document.createElement('script')
		script.crossOrigin = 'anonymous'
		script.type = 'application/javascript'
		script.src = 'https://cdn.jsdelivr.net/npm/@qlik/embed-web-components'
		script.setAttribute('data-host', tenantUrl)
		script.setAttribute('data-client-id', qlikClientId)
		script.setAttribute('data-access-code', qlikEmbedAccessCode)
		script.setAttribute('data-auth-type', 'anonymous')

		document.body.appendChild(script)
	}
}

// Fetch JSON data from the local file
export async function fetchJsonData(url) {
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error('Failed to fetch JSON data')
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.error('Error fetching JSON data:', error)
		throw error
	}
}
