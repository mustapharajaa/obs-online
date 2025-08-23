// Frontend Backend Manager
class FrontendBackendManager {
    constructor() {
        this.currentBackend = localStorage.getItem('selectedBackend') || 'local';
        this.configs = {
            local: {
                url: 'http://localhost:3005',
                name: 'Local Development',
                description: 'Local Node.js server'
            },
            redis: {
                url: 'https://your-redis-backend.vercel.app',
                name: 'Redis Backend',
                description: 'Vercel + Redis deployment'
            },
            vpc: {
                url: 'https://your-vpc-backend.com',
                name: 'VPC Backend', 
                description: 'Private cloud deployment'
            }
        };
        this.initializeUI();
    }

    initializeUI() {
        // Add backend selector to the page
        const controlPanel = document.querySelector('.control-panel');
        if (controlPanel) {
            const backendSelector = this.createBackendSelector();
            controlPanel.insertBefore(backendSelector, controlPanel.firstChild);
        }
    }

    createBackendSelector() {
        const container = document.createElement('div');
        container.className = 'backend-selector';
        container.style.cssText = `
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #007bff;
        `;

        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #333;">🔧 Backend Configuration</h3>
                <button id="refreshBackend" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Refresh</button>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${Object.entries(this.configs).map(([key, config]) => `
                    <button class="backend-btn" data-backend="${key}" 
                            style="padding: 8px 16px; border: 2px solid ${this.currentBackend === key ? '#007bff' : '#ddd'}; 
                                   background: ${this.currentBackend === key ? '#007bff' : 'white'}; 
                                   color: ${this.currentBackend === key ? 'white' : '#333'}; 
                                   border-radius: 6px; cursor: pointer; transition: all 0.3s;">
                        <div style="font-weight: bold;">${config.name}</div>
                        <div style="font-size: 12px; opacity: 0.8;">${config.description}</div>
                    </button>
                `).join('')}
            </div>
            <div id="backendStatus" style="margin-top: 10px; padding: 8px; background: #e9ecef; border-radius: 4px; font-size: 14px;">
                Current: <strong>${this.configs[this.currentBackend].name}</strong> - ${this.configs[this.currentBackend].url}
            </div>
        `;

        // Add event listeners
        container.addEventListener('click', (e) => {
            if (e.target.closest('.backend-btn')) {
                const backend = e.target.closest('.backend-btn').dataset.backend;
                this.switchBackend(backend);
            }
            if (e.target.id === 'refreshBackend') {
                this.testConnection();
            }
        });

        return container;
    }

    switchBackend(backend) {
        if (this.configs[backend]) {
            this.currentBackend = backend;
            localStorage.setItem('selectedBackend', backend);
            
            // Update UI
            document.querySelectorAll('.backend-btn').forEach(btn => {
                const isSelected = btn.dataset.backend === backend;
                btn.style.border = `2px solid ${isSelected ? '#007bff' : '#ddd'}`;
                btn.style.background = isSelected ? '#007bff' : 'white';
                btn.style.color = isSelected ? 'white' : '#333';
            });

            // Update status
            const status = document.getElementById('backendStatus');
            if (status) {
                status.innerHTML = `Current: <strong>${this.configs[backend].name}</strong> - ${this.configs[backend].url}`;
            }

            // Reconnect socket if needed
            this.reconnectSocket();
            
            this.showNotification(`Switched to ${this.configs[backend].name}`, 'success');
        }
    }

    getCurrentUrl() {
        return this.configs[this.currentBackend].url;
    }

    getApiUrl(endpoint = '') {
        return `${this.getCurrentUrl()}${endpoint}`;
    }

    async testConnection() {
        const url = this.getCurrentUrl();
        try {
            const response = await fetch(`${url}/api/health`, { 
                method: 'GET',
                timeout: 5000 
            });
            
            if (response.ok) {
                this.showNotification(`✅ Connected to ${this.configs[this.currentBackend].name}`, 'success');
            } else {
                this.showNotification(`❌ Backend responded with error: ${response.status}`, 'error');
            }
        } catch (error) {
            this.showNotification(`❌ Cannot connect to ${this.configs[this.currentBackend].name}`, 'error');
        }
    }

    reconnectSocket() {
        // Disconnect existing socket
        if (window.socket) {
            window.socket.disconnect();
        }
        
        // Create new socket connection
        const socketUrl = this.getCurrentUrl();
        window.socket = io(socketUrl);
        
        // Reattach socket event listeners
        this.attachSocketListeners();
    }

    attachSocketListeners() {
        if (!window.socket) return;

        window.socket.on('connect', () => {
            console.log('Connected to backend:', this.getCurrentUrl());
        });

        window.socket.on('disconnect', () => {
            console.log('Disconnected from backend');
        });

        // Add your existing socket event listeners here
        window.socket.on('streamStatus', (data) => {
            // Handle stream status updates
            console.log('Stream status:', data);
        });
    }

    showNotification(message, type = 'info') {
        // Use existing notification system or create simple one
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Method to update backend URLs dynamically
    updateBackendUrl(backend, newUrl) {
        if (this.configs[backend]) {
            this.configs[backend].url = newUrl;
            localStorage.setItem(`backend_${backend}_url`, newUrl);
            
            if (backend === this.currentBackend) {
                this.reconnectSocket();
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.backendManager = new FrontendBackendManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrontendBackendManager;
}
