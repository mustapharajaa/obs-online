// Connect to backend server
document.addEventListener('DOMContentLoaded', () => {
    const activeBackend = localStorage.getItem('selectedBackend') || 'local';
    const backendConfigs = JSON.parse(localStorage.getItem('backendConfigs') || '{}');
    let backendUrl = window.location.origin;

    console.log('🔧 Debug - Active Backend Setting:', activeBackend);

    function setupRdpHttpMode() {
        console.log('✅ RDP Backend is responsive via proxy. Forcing HTTP-only mode.');
        if (window.showNotification) {
            window.showNotification('✅ RDP Backend connected (HTTP mode)', 'success');
        }
        window.rdpBackendMode = 'http-only';
    }

    function handleRdpConnectionError(error) {
        console.log('❌ RDP backend connection failed via proxy:', error.message);
        if (window.showNotification) {
            window.showNotification('❌ Cannot connect to RDP Backend', 'error');
        }
    }

    function connectWithSocketIO() {
        if (typeof io === 'undefined') {
            console.error('Socket.IO client not loaded.');
            if (window.showNotification) {
                window.showNotification('❌ Frontend error: Socket.IO library missing', 'error');
            }
            return;
        }
        console.log('🔧 Debug - Attempting Socket.IO connection...');
        if (backendConfigs[activeBackend]) {
            backendUrl = backendConfigs[activeBackend].url;
        }
        const socketOptions = {
            rejectUnauthorized: false,
            transports: ['polling', 'websocket'],
            timeout: 10000,
            forceNew: true
        };
        window.socket = io(backendUrl, socketOptions);

        window.socket.on('connect', () => {
            console.log(`✅ Connected to backend at ${backendUrl}`);
            if (window.showNotification) {
                window.showNotification('✅ Connected to backend server', 'success');
            }
        });

        window.socket.on('disconnect', () => {
            console.log('❌ Disconnected from backend');
            if (window.showNotification) {
                window.showNotification('❌ Backend connection lost', 'error');
            }
        });

        window.socket.on('connect_error', (error) => {
            console.log('❌ Connection error:', error);
            if (window.showNotification) {
                window.showNotification('❌ Cannot connect to backend', 'error');
            }
        });
    }

    // Prioritize checking the RDP proxy. If it works, use it regardless of localStorage.
    fetch('/api/rdp-proxy', { mode: 'cors', credentials: 'omit' })
        .then(response => {
            if (response.ok) {
                // The proxy is working, which means we should be in RDP mode.
                setupRdpHttpMode();
            } else {
                // The proxy endpoint exists but the RDP backend is likely offline.
                // We should not fallback to Socket.IO here, but show an RDP-specific error.
                handleRdpConnectionError(new Error(`Proxy responded with status ${response.status}`));
            }
        })
        .catch(error => {
            // This catch block runs if the /api/rdp-proxy endpoint itself doesn't exist (404) or fails to resolve.
            // This implies we are NOT trying to connect to the RDP backend, so we can safely fallback to the default Socket.IO connection.
            console.log('🔧 Debug - RDP proxy not found. Falling back to default connection mode.');
            connectWithSocketIO();
        });
});
