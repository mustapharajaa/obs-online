// Vercel API route to proxy requests to RDP backend
// This bypasses mixed content policy (HTTPS -> HTTP)

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const RDP_PRIMARY_URL = 'http://45.76.80.59:3005'; // Primary (HTTP)
    const RDP_FALLBACK_URL = 'https://45.76.80.59:3006'; // Fallback (HTTPS)

    // The fetch logic needs to bypass Node.js's default rejection of self-signed certs for the HTTPS endpoint.
    const https = require('https');
    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    async function tryFetch(url) {
        const healthUrl = `${url}/api/health`;
        console.log(`Proxy attempting to connect to: ${healthUrl}`);
        const options = url.startsWith('https') ? { agent } : {};
        const response = await fetch(healthUrl, options);
        if (!response.ok) {
            throw new Error(`Backend at ${url} responded with status ${response.status}`);
        }
        return response;
    }

    try {
        let response;
        let connectedUrl;
        try {
            response = await tryFetch(RDP_PRIMARY_URL);
            connectedUrl = RDP_PRIMARY_URL;
            console.log(`✅ Proxy connected successfully to primary URL: ${connectedUrl}`);
        } catch (primaryError) {
            console.warn(`⚠️ Primary URL failed: ${primaryError.message}. Trying fallback...`);
            try {
                response = await tryFetch(RDP_FALLBACK_URL);
                connectedUrl = RDP_FALLBACK_URL;
                console.log(`✅ Proxy connected successfully to fallback URL: ${connectedUrl}`);
            } catch (fallbackError) {
                console.error(`❌ Fallback URL also failed: ${fallbackError.message}`);
                // Throw the original primary error to be caught by the outer try-catch
                throw primaryError; 
            }
        }

        const data = await response.json();
        return res.status(200).json({
            status: 'ok',
            message: 'RDP backend is reachable via proxy.',
            proxy_connected_to: connectedUrl,
            backend_response: data
        });

    } catch (error) {
        console.error('RDP Proxy Error:', error.message);
        return res.status(500).json({
            error: 'RDP Backend connection failed',
            message: error.message,
            tried_urls: [RDP_PRIMARY_URL, RDP_FALLBACK_URL]
        });
    }
}
