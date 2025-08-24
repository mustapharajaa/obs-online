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

    const https = require('https');
    const agent = new https.Agent({ rejectUnauthorized: false });

    async function tryFetch(url) {
        const healthUrl = `${url}/api/health`;
        console.log(`[PROXY] Attempting to connect to: ${healthUrl}`);
        const options = {
            ...(url.startsWith('https') && { agent }),
            // Set a timeout to avoid long waits for a non-responsive server
            signal: AbortSignal.timeout(10000) // 10 seconds
        };
        
        try {
            const response = await fetch(healthUrl, options);
            if (!response.ok) {
                throw new Error(`Non-2xx status: ${response.status}`);
            }
            console.log(`[PROXY] Successfully connected to ${healthUrl}`);
            return response;
        } catch (e) {
            // Log detailed error information
            console.error(`[PROXY] Failed to connect to ${healthUrl}. Error: ${e.name}, Message: ${e.message}`);
            throw e; // Re-throw to be caught by the fallback logic
        }
    }

    try {
        let response;
        let connectedUrl;
        try {
            response = await tryFetch(RDP_PRIMARY_URL);
            connectedUrl = RDP_PRIMARY_URL;
        } catch (primaryError) {
            console.warn('[PROXY] Primary URL failed. Trying fallback...');
            try {
                response = await tryFetch(RDP_FALLBACK_URL);
                connectedUrl = RDP_FALLBACK_URL;
            } catch (fallbackError) {
                console.error('[PROXY] Fallback URL also failed.');
                // Return a detailed error response
                return res.status(502).json({
                    error: 'Bad Gateway',
                    message: 'The proxy server could not connect to the RDP backend.',
                    primary_error: { name: primaryError.name, message: primaryError.message },
                    fallback_error: { name: fallbackError.name, message: fallbackError.message },
                    tried_urls: [RDP_PRIMARY_URL, RDP_FALLBACK_URL]
                });
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
        // This outer catch is for unexpected errors in the handler itself
        console.error('[PROXY] Unhandled error in proxy handler:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
