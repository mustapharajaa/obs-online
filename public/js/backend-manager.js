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
        
        // Special handling for RDP backend - it's HTTP only, not Socket.IO
        if (activeBackend === 'rdp') {
            console.log('🔧 Debug - RDP backend detected - using HTTP mode...');
            
            // Test HTTP connection to RDP backend
            fetch(backendUrl)
                .then(response => {
                    console.log('🔧 Debug - RDP backend HTTP test:', response.status);
                    if (response.ok) {
                        console.log('✅ RDP Backend connected via HTTP');
                        if (window.showNotification) {
                            window.showNotification('✅ RDP Backend connected (HTTP mode)', 'success');
                        }
                        
                        // Set up HTTP-only mode for RDP backend
                        window.rdpBackendMode = 'http-only';
                        window.rdpBackendUrl = backendUrl;
                        
                        // No Socket.IO connection needed for RDP backend
                        return;
                    } else {
                        throw new Error('RDP backend server not responding');
                    }
                })
                .catch(error => {
                    console.log('❌ RDP backend connection failed:', error);
                    if (window.showNotification) {
                        window.showNotification('❌ Cannot connect to RDP Backend', 'error');
                    }
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
