# 🎥 recORDscreen - Real-Time RTMP Streaming System

A powerful Node.js application for real-time browser screen recording and RTMP streaming using Puppeteer and a patched puppeteer-screen-recorder library. Stream directly to YouTube Live, Twitch, or any RTMP endpoint with real-time duration tracking and viewport management.

## ✨ Features

### 🎬 Core Streaming
- **Direct RTMP Streaming**: No intermediate MP4 files - stream directly to RTMP endpoints
- **Multi-Stream Support**: Handle multiple concurrent streams with unique IDs
- **Real-Time Duration Tracking**: Parse FFMPEG stderr for accurate streaming duration
- **Automatic Retry Logic**: Built-in RTMP connection retry mechanism (up to 3 attempts)

### 🖥️ Browser Automation
- **Puppeteer Integration**: Automated browser control with custom viewport settings
- **Cookie Management**: Automatic cookie application for authenticated sessions
- **Viewport Detection**: Real-time viewport parameter detection and adjustment
- **Scroll Position Control**: Precise scroll positioning for optimal capture

### 📊 Management Interface
- **Live Streams Dashboard**: Real-time monitoring of active streams at `/lives`
- **Stream State Management**: JSON-based state file system for stream configuration
- **Socket.IO Integration**: Real-time updates between server and client
- **Duration Display**: Live duration updates on the management interface

### 🔧 Technical Features
- **Patched Library**: Custom-modified puppeteer-screen-recorder for RTMP support
- **FFMPEG Integration**: Direct FFMPEG process management and monitoring
- **Error Handling**: Comprehensive error handling with detailed logging
- **Process Management**: Clean stream termination and resource cleanup

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Chrome/Chromium browser
- FFMPEG (automatically installed via @ffmpeg-installer)

### Installation
```bash
# Clone the repository
git clone https://github.com/mustapharajaa/recORDscreen.git
cd recORDscreen

# Install dependencies
npm install

# Start the server
node patched-rtmp-test.js
```

### Usage
1. **Start Server**: `node patched-rtmp-test.js`
2. **Open Control Panel**: Navigate to `http://localhost:3005`
3. **Configure Stream**: Enter URL, RTMP endpoint, and stream key
4. **Monitor Streams**: Visit `http://localhost:3005/lives` for live monitoring
5. **Start Streaming**: Click "Start Stream" to begin RTMP streaming

## 📁 Project Structure

```
recORDscreen/
├── patched-rtmp-test.js          # Main server with RTMP streaming logic
├── patched-rtmp-viewer.html      # Stream control panel interface
├── lives.html                    # Live streams monitoring dashboard
├── viewport-detection.js         # Browser viewport detection utilities
├── cookies-helper.js             # Cookie management for authenticated sessions
├── browser-state-data.txt        # Default browser state configuration
├── puppeteer-screen-recorder-main/ # Patched library for RTMP support
├── videos/                       # Video output directory (if needed)
└── node_modules/                 # Dependencies
```

## 🔧 Configuration

### RTMP Settings
```javascript
const recordingConfig = {
    fps: 15,                    // Frame rate
    videoBitrate: 2500,         // Video bitrate (kbps)
    aspectRatio: '16:9',        // Video aspect ratio
    autopad: { color: 'black' } // Padding for aspect ratio
};
```

### Browser Settings
```javascript
const browserArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--window-size=1228,795',
    '--window-position=251,66'
];
```

## 📡 RTMP Endpoints

### YouTube Live
```
RTMP URL: rtmp://a.rtmp.youtube.com/live2/
Stream Key: [Your YouTube Stream Key]
```

### Twitch
```
RTMP URL: rtmp://live.twitch.tv/live/
Stream Key: [Your Twitch Stream Key]
```

### Custom RTMP Server
```
RTMP URL: rtmp://your-server.com/live/
Stream Key: [Your Custom Stream Key]
```

## 🎯 API Endpoints

### Socket.IO Events
- `startPatchedRTMPStream`: Start a new RTMP stream
- `stopStream`: Stop an active stream
- `getStreamsList`: Get list of active streams
- `durationUpdate`: Real-time duration updates
- `streamError`: Stream error notifications

### HTTP Routes
- `GET /`: Main control panel
- `GET /lives`: Live streams dashboard
- `POST /api/streams`: Stream management API

## 🔍 Monitoring & Debugging

### Server Logs
```bash
🚀 [Stream 1] Starting PATCHED RTMP streaming
✅ [Stream 1] FFMPEG duration monitoring attached
⏱️ Duration: 00:01:23.45
```

### Client Console
```javascript
// Duration updates
Duration update received: {streamId: 1, duration: "00:01:23.45"}

// Stream status
Stream 1 status: active, duration: 00:01:23.45
```

## 🛠️ Troubleshooting

### Common Issues

**RTMP Connection Errors**
- Verify stream key is valid and active
- Check network connectivity
- Reduce bitrate if connection is unstable

**Duration Not Updating**
- Ensure Socket.IO connection is established
- Check server logs for FFMPEG process errors
- Verify `durationUpdate` listener is active

**Browser Launch Failures**
- Install Chrome/Chromium browser
- Check Chrome executable path
- Verify browser arguments compatibility

## 🔧 Development

### Patched Library
The project uses a custom-patched version of puppeteer-screen-recorder located in `puppeteer-screen-recorder-main/`. Key modifications:

- **RTMP Support**: Direct streaming to RTMP endpoints
- **Duration Parsing**: Real-time FFMPEG stderr monitoring
- **Stream ID Tracking**: Multi-stream process management

### Key Files Modified
- `src/lib/pageVideoStreamWriter.ts`: Core RTMP streaming logic
- `src/lib/pageVideoStreamTypes.ts`: Type definitions for RTMP

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review server logs for error details

---

**Built with ❤️ for real-time streaming**
