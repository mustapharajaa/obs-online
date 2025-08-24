// Connect to backend server
document.addEventListener('DOMContentLoaded', () => {
    // Get active backend from admin settings or default to current origin
    const activeBackend = localStorage.getItem('selectedBackend') || 'local';
    const backendConfigs = JSON.parse(localStorage.getItem('backendConfigs') || '{}');
    
    console.log('🔧 Debug - Active Backend:', activeBackend);
    console.log('🔧 Debug - Backend Configs:', backendConfigs);
    
    let backendUrl = window.location.origin; // Default to current origin (works with Vercel)
    
    if (backendConfigs[activeBackend]) {
        backendUrl = backendConfigs[activeBackend].url;
        console.log('🔧 Debug - Using configured URL:', backendUrl);
    } else {
        console.log('🔧 Debug - No config found, using current origin:', backendUrl);
    }
    
    if (typeof io !== 'undefined') {
        // Configure Socket.IO to ignore SSL certificate errors for self-signed certificates
        const socketOptions = {
            rejectUnauthorized: false,
            transports: ['polling', 'websocket'], // Try polling first, then websocket
            timeout: 10000,
            forceNew: true
        };
        
        // Special handling for RDP backend
        if (activeBackend === 'rdp') {
            console.log('🔧 Debug - Attempting RDP backend connection...');
            
            // First try to test if the server responds to HTTP requests
            fetch(backendUrl + '/health')
                .then(response => {
                    console.log('🔧 Debug - RDP backend health check:', response.status);
                    if (response.ok) {
                        connectWithSocketIO();
                    } else {
                        handleRDPConnectionFailure('RDP backend server not responding');
                    }
                })
                .catch(error => {
                    console.log('🔧 Debug - RDP backend health check failed:', error);
                    // Try Socket.IO connection anyway
                    connectWithSocketIO();
                });
        } else {
            connectWithSocketIO();
        }
        
        function connectWithSocketIO() {
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
                if (activeBackend === 'rdp') {
                    handleRDPConnectionFailure(error.message);
                } else {
                    if (window.showNotification) {
                        window.showNotification('❌ Cannot connect to backend', 'error');
                    }
                }
            });
        }
        
        function handleRDPConnectionFailure(errorMessage) {
            console.log('🔧 Debug - RDP connection failed, trying fallback...');
            if (window.showNotification) {
                window.showNotification('⚠️ RDP Backend: Using HTTP fallback mode', 'warning');
            }
            
            // Set up a simple HTTP-based communication fallback
            window.rdpBackendMode = 'http-fallback';
            window.rdpBackendUrl = backendUrl;
        }
    }
});
