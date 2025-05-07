import { auth, apps, qix } from '@qlik/api'

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
	console.log('loadQlikScriptAnon', tenantUrl, qlikClientId, qlikEmbedAccessCode)
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

/**
 * Copy text to the clipboard
 * @param {string} text - Text to copy
 * @param {HTMLElement} targetElement - L'élément DOM où afficher l'icône
 * @returns {Promise<void>} - A promise that is fulfilled if the copy succeeds
 */
export const copyToClipboard = async (text, targetElement) => {
	try {
		await navigator.clipboard.writeText(text);
		console.log(`Texte copié dans le presse-papiers : ${text}`);

		const icon = document.createElement('span');
		icon.innerHTML = '✔️';
		icon.style.color = 'green';
		icon.style.marginLeft = '10px';
		icon.style.fontSize = '1.2rem';
		icon.style.transition = 'opacity 0.5s ease';
		icon.style.opacity = '1';

		targetElement.appendChild(icon);

		setTimeout(() => {
			icon.style.opacity = '0';
			setTimeout(() => targetElement.removeChild(icon), 500);
		}, 2000);
	} catch (error) {
		console.error('Erreur lors de la copie dans le presse-papiers :', error);
		//alert('Erreur lors de la copie dans le presse-papiers');
	}
};

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

export async function checkSheetsApplications(tenantUrl, qlikClientId, redirectUrl, appId) {
	try {
		auth.setDefaultHostConfig({
			host: tenantUrl,
			authType: 'Oauth2',
			clientId: qlikClientId,
			redirectUri: redirectUrl,
			accessTokenStorage: 'session',
			autoRedirect: true,
		})

		const session = qix.openAppSession({ appId: appId })
		const QlikApp = await session.getDoc()
		const sheetsListResponse = await QlikApp.getSheetList()

		if (Array.isArray(sheetsListResponse)) {
			sheetsList.value = sheetsListResponse
		} else {
			throw new Error('Invalid sheets list format')
		}

		const fetchedApplications = []
		for (const appId of qlikAppsId) {
			const session = qix.openAppSession({ appId })
			const QlikApp = await session.getDoc()
			const appLayout = await QlikApp.getAppLayout()
			const sheetsListResponse = await QlikApp.getSheetList()

			if (Array.isArray(sheetsListResponse)) {
				fetchedApplications.push({
					qId: appId,
					name: appLayout.qTitle,
					sheets: sheetsListResponse,
				})
			} else {
				throw new Error('Invalid sheets list format')
			}
		}
		applicationsData.value = fetchedApplications
	} catch (error) {
		console.error('Error fetching objects from qlik:', error)
	}
}
