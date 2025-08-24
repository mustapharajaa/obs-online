document.addEventListener('DOMContentLoaded', () => {
    const activeBackend = localStorage.getItem('selectedBackend') || 'local';
    const backendConfigs = JSON.parse(localStorage.getItem('backendConfigs') || '{}');

    let backendUrl = window.location.origin; // Default for local/Vercel deployment

    if (backendConfigs[activeBackend] && backendConfigs[activeBackend].url) {
        backendUrl = backendConfigs[activeBackend].url;
    }

    function initializeSocket(url) {
        window.socket = io(url);

        window.socket.on('connect', () => {
            console.log(`✅ Connected to backend at ${url}`);
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
            console.log(`❌ Connection error to ${url}:`, error);
            if (window.showNotification) {
                window.showNotification('❌ Cannot connect to backend', 'error');
            }
        });
    }

    // Dynamically load the socket.io script from the correct backend URL
    const script = document.createElement('script');
    script.src = `${backendUrl}/socket.io/socket.io.js`;
    
    script.onload = () => {
        console.log(`Socket.IO script loaded from ${backendUrl}`);
        initializeSocket(backendUrl);
    };
    
    script.onerror = () => {
        console.error(`❌ Failed to load Socket.IO script from ${backendUrl}`);
        if (window.showNotification) {
            window.showNotification('❌ Failed to load core library from backend', 'error');
        }
    };

    document.head.appendChild(script);
});
