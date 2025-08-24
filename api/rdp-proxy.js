// Vercel API route to proxy requests to RDP backend
// This bypasses mixed content policy (HTTPS -> HTTP)

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const RDP_BACKEND_URL = 'http://45.76.80.59:3005';
    
    try {
        // Health check endpoint - check root path as it returns 200 OK
        if (req.url === '/api/rdp-proxy' || req.url === '/api/rdp-proxy/') {
            const response = await fetch(`${RDP_BACKEND_URL}/api/health`);
            
            if (response.ok) {
                // If backend is reachable, return a success status
                return res.status(200).json({
                    status: 'ok',
                    message: 'RDP backend is reachable via proxy.',
                    proxy: 'vercel',
                    rdp_backend: RDP_BACKEND_URL
                });
            } else {
                // If backend returns an error status, forward it
                throw new Error(`RDP backend returned status ${response.status}`);
            }
        }
        
        // Proxy other requests
        const targetPath = req.url.replace('/api/rdp-proxy', '');
        const targetUrl = `${RDP_BACKEND_URL}${targetPath}`;
        
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                ...req.headers
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });
        
        const data = await response.json();
        return res.status(response.status).json(data);
        
    } catch (error) {
        console.error('RDP Proxy Error:', error);
        return res.status(500).json({
            error: 'RDP Backend connection failed',
            message: error.message,
            rdp_backend: RDP_BACKEND_URL
        });
    }
}
