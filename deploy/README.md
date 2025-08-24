# Deployment Guide: Vercel Frontend + Flexible Backend

## Quick Setup

### 1. Vercel Frontend Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# BACKEND_TYPE=redis (or vpc)
# REDIS_BACKEND_URL=your-redis-backend-url
# VPC_BACKEND_URL=your-vpc-backend-url
```

### 2. Backend Options

#### Option A: Redis Backend (Recommended)
```bash
# Deploy backend to Vercel with Redis
vercel --prod --env REDIS_URL=your-redis-connection-string
```

#### Option B: VPC Backend
```bash
# Deploy to your VPC provider (DigitalOcean, AWS, etc.)
# Update VPC_BACKEND_URL in Vercel environment variables
```

### 3. Easy Backend Switching

#### Method 1: Environment Variables (Production)
```bash
# In Vercel dashboard, change:
BACKEND_TYPE=redis  # or vpc
```

#### Method 2: Frontend UI (Development)
- Use the backend selector in the control panel
- Switch between Local/Redis/VPC backends instantly
- Settings persist in localStorage

#### Method 3: Programmatic (API)
```javascript
// Update backend URL dynamically
window.backendManager.updateBackendUrl('redis', 'https://new-redis-backend.com');
window.backendManager.switchBackend('redis');
```

## File Structure
```
├── vercel.json              # Vercel configuration
├── config/backend.js        # Backend configuration manager
├── public/js/backend-manager.js  # Frontend backend switcher
├── .env.example            # Environment variables template
└── deploy/README.md        # This guide
```

## Environment Variables

### Required for Vercel:
- `BACKEND_TYPE`: local|redis|vpc
- `REDIS_BACKEND_URL`: Redis backend URL
- `VPC_BACKEND_URL`: VPC backend URL

### Optional:
- `REDIS_URL`: Redis connection string
- `NODE_ENV`: production

## Backend URLs Configuration

Update these URLs in `public/js/backend-manager.js`:

```javascript
configs: {
    redis: {
        url: 'https://your-actual-redis-backend.vercel.app',
        // ...
    },
    vpc: {
        url: 'https://your-actual-vpc-backend.com',
        // ...
    }
}
```

## Testing

1. **Local**: `npm start` - Uses localhost:3005
2. **Redis**: Click "Redis Backend" in UI
3. **VPC**: Click "VPC Backend" in UI
4. **Health Check**: Click "Refresh" button

## Deployment Commands

```bash
# Frontend only
vercel --prod

# With specific backend
vercel --prod --env BACKEND_TYPE=redis

# Update environment variable
vercel env add BACKEND_TYPE production
```
