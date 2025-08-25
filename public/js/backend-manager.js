document.addEventListener('DOMContentLoaded', () => {
    const activeBackend = localStorage.getItem('selectedBackend') || 'local';
    const backendConfigs = JSON.parse(localStorage.getItem('backendConfigs') || '{}');

    let backendUrl;

    // Set the default backend URL based on the environment
    if (window.location.hostname === 'obs.liveenity.com') {
        backendUrl = 'https://api.liveenity.com';
    } else {
        backendUrl = window.location.origin; // Default for local development
    }

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
        // Dispatch a custom event to notify that the socket is ready
        document.dispatchEvent(new Event('socketInitialized'));

        // Initialize video modal controls after everything is loaded
        initializeVideoControls();
    };
    
    script.onerror = () => {
        console.error(`❌ Failed to load Socket.IO script from ${backendUrl}`);
        if (window.showNotification) {
            window.showNotification('❌ Failed to load core library from backend', 'error');
        }
    };

    document.head.appendChild(script);
});

function initializeVideoControls() {
    const videoContainer = document.getElementById('videoContainer');
    const videoModal = document.getElementById('videoModal');

    // Function to show the modal
    window.showVideoModal = function() {
        if (videoModal) videoModal.style.display = 'flex';
    }

    // Function to hide the modal
    window.hideVideoModal = function() {
        if (videoModal) videoModal.style.display = 'none';
    }

    // Function to hide the preview forever
    window.hideVideoForever = function(event) {
        event.stopPropagation(); // Prevent bubbling to the container
        if (videoContainer) videoContainer.style.display = 'none';
        localStorage.setItem('hideVideoPreview', 'true');
    }

    // Check local storage on load
    if (localStorage.getItem('hideVideoPreview') === 'true') {
        if (videoContainer) videoContainer.style.display = 'none';
    }

    // Attach event listeners directly
    if (videoContainer) {
        videoContainer.onclick = window.showVideoModal;
        const closeButton = videoContainer.querySelector('button');
        if (closeButton) {
            closeButton.onclick = window.hideVideoForever;
        }
    }
    
    if (videoModal) {
        const closeButton = videoModal.querySelector('button');
        if (closeButton) {
            closeButton.onclick = window.hideVideoModal;
        }
    }
}
