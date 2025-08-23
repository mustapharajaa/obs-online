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
            transports: ['websocket', 'polling']
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
                window.showNotification('❌ Cannot connect to RDP Backend', 'error');
            }
        });
    }
});
