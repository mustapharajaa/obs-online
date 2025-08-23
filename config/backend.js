// Backend Configuration Manager
class BackendConfig {
    constructor() {
        this.configs = {
            local: {
                url: 'http://localhost:3005',
                type: 'local',
                websocket: 'ws://localhost:3005'
            },
            redis: {
                url: process.env.REDIS_BACKEND_URL || 'https://your-redis-backend.vercel.app',
                type: 'redis',
                websocket: process.env.REDIS_WS_URL || 'wss://your-redis-backend.vercel.app'
            },
            vpc: {
                url: process.env.VPC_BACKEND_URL || 'https://your-vpc-backend.com',
                type: 'vpc',
                websocket: process.env.VPC_WS_URL || 'wss://your-vpc-backend.com'
            }
        };
        
        this.currentBackend = process.env.BACKEND_TYPE || 'local';
    }

    getCurrentConfig() {
        return this.configs[this.currentBackend];
    }

    switchBackend(type) {
        if (this.configs[type]) {
            this.currentBackend = type;
            return this.getCurrentConfig();
        }
        throw new Error(`Backend type '${type}' not found`);
    }

    getApiUrl(endpoint = '') {
        const config = this.getCurrentConfig();
        return `${config.url}/api${endpoint}`;
    }

    getWebSocketUrl() {
        const config = this.getCurrentConfig();
        return config.websocket;
    }

    getAllConfigs() {
        return this.configs;
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackendConfig;
} else {
    window.BackendConfig = BackendConfig;
}
