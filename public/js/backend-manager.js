// Connect to RDP backend server
document.addEventListener('DOMContentLoaded', () => {
    // Get active backend from admin settings or default to RDP
    const activeBackend = localStorage.getItem('selectedBackend') || 'rdp';
    const backendConfigs = JSON.parse(localStorage.getItem('backendConfigs') || '{}');
    
    console.log('🔧 Debug - Active Backend:', activeBackend);
    console.log('🔧 Debug - Backend Configs:', backendConfigs);
    
    let backendUrl = 'http://YOUR_RDP_IP_HERE:3005'; // Default fallback
    
    if (backendConfigs[activeBackend]) {
        backendUrl = backendConfigs[activeBackend].url;
        console.log('🔧 Debug - Using configured URL:', backendUrl);
    } else {
        console.log('🔧 Debug - No config found, using fallback URL');
    }
    
    if (typeof io !== 'undefined') {
        window.socket = io(backendUrl);
        
        window.socket.on('connect', () => {
            console.log(`✅ Connected to backend at ${backendUrl}`);
            if (window.showNotification) {
                window.showNotification('✅ Connected to backend server', 'success');
            }
        });
        
        window.socket.on('disconnect', () => {
            console.log('❌ Disconnected from RDP backend');
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
});
