export function loadQlikScript(tenantUrl, qlikClientId, redirectUrl) {
	if (!document.querySelector('script[src="https://cdn.jsdelivr.net/npm/@qlik/embed-web-components"]')) {
		const script = document.createElement('script');
		script.crossOrigin = 'anonymous';
		script.type = 'application/javascript';
		script.src = 'https://cdn.jsdelivr.net/npm/@qlik/embed-web-components';
		script.setAttribute('data-host', tenantUrl);
		script.setAttribute('data-client-id', qlikClientId);
		script.setAttribute('data-redirect-uri', redirectUrl);
		script.setAttribute('data-access-token-storage', 'session');
		script.setAttribute('data-cross-site-cookies', 'true');
		script.setAttribute('data-auto-redirect', 'true');

		document.body.appendChild(script);
	}
}