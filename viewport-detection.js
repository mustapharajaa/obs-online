// ENHANCED SVELTE-BROWSER VIEWPORT DETECTION
// Integrates ALL advanced features from svelte-browser library

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('🚀 ENHANCED SVELTE-BROWSER VIEWPORT DETECTION');
console.log('🎯 Includes: Sensors, Gamepad, Audio, Advanced Device Detection');
console.log('='.repeat(70));

const TEST_URL = 'https://www.aiscore.com/match-shan-united-svay-rieng-fc/ezk96i3o9wrh1kn';
const SAVE_FILE = 'browser-state-data.txt';

// Enhanced detection script with ALL svelte-browser features
const ENHANCED_DETECTION_SCRIPT = `
class EnhancedSvelteBrowserDetection {
    constructor() {
        this.data = {};
        this.setupUI();
        this.setupPersistence();
        console.log('✅ Enhanced detection system initialized');
    }
    
    setupPersistence() {
        // Store reference globally for persistence
        window.enhancedDetection = this;
        
        // CRITICAL: Re-inject UI immediately when DOM is ready (for page refresh)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('🔄 DOM loaded - ensuring UI is present...');
                if (!document.getElementById('enhanced-svelte-ui')) {
                    this.setupUI();
                }
            });
        } else {
            // DOM already loaded, check immediately
            if (!document.getElementById('enhanced-svelte-ui')) {
                console.log('🔄 DOM already loaded - re-injecting UI...');
                this.setupUI();
            }
        }
        
        // Re-inject UI on page navigation/refresh
        window.addEventListener('beforeunload', () => {
            console.log('🔄 Page unloading - UI will be restored on reload');
        });
        
        // Re-inject UI on page focus (in case it gets lost)
        window.addEventListener('focus', () => {
            if (!document.getElementById('enhanced-svelte-ui')) {
                console.log('🔄 UI missing - re-injecting...');
                this.setupUI();
            }
        });
        
        // Re-inject UI on visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !document.getElementById('enhanced-svelte-ui')) {
                console.log('🔄 Page visible but UI missing - re-injecting...');
                this.setupUI();
            }
        });
        
        // Periodic check to ensure UI stays visible
        setInterval(() => {
            if (!document.getElementById('enhanced-svelte-ui')) {
                console.log('🔄 Periodic check: UI missing - re-injecting...');
                this.setupUI();
            }
        }, 5000); // Check every 5 seconds
        
        console.log('✅ Persistence mechanisms activated');
    }
    
    setupUI() {
        // Remove existing UI if it exists (for refresh scenarios)
        const existingUI = document.getElementById('enhanced-svelte-ui');
        if (existingUI) {
            existingUI.remove();
        }
        
        const ui = document.createElement('div');
        ui.id = 'enhanced-svelte-ui'; // Add ID for persistence
        ui.style.cssText = \`
            position: fixed; top: 10px; right: 10px; z-index: 999999;
            background: rgba(0,0,0,0.9); padding: 15px; border-radius: 10px;
            color: white; font-family: monospace; font-size: 11px;
            max-width: 300px; backdrop-filter: blur(10px);
            border: 2px solid #4ade80;
        \`;
        
        // Create elements using DOM methods (bypasses TrustedHTML restrictions)
        const title = document.createElement('div');
        title.style.cssText = 'color: #4ade80; font-weight: bold; margin-bottom: 10px;';
        title.textContent = '🚀 ENHANCED SVELTE-BROWSER DETECTION';
        
        const captureBtn = document.createElement('button');
        captureBtn.id = 'captureAll';
        captureBtn.style.cssText = 'background: #4ade80; color: black; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; margin: 2px;';
        captureBtn.textContent = '📊 CAPTURE ALL';
        
        const sensorsBtn = document.createElement('button');
        sensorsBtn.id = 'startSensors';
        sensorsBtn.style.cssText = 'background: #6366f1; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; margin: 2px;';
        sensorsBtn.textContent = '🧭 START SENSORS';
        
        const clipboardBtn = document.createElement('button');
        clipboardBtn.id = 'copyToClipboard';
        clipboardBtn.style.cssText = 'background: #f59e0b; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; margin: 2px;';
        clipboardBtn.textContent = '📋 COPY TO CLIPBOARD';
        
        const loadBtn = document.createElement('button');
        loadBtn.id = 'loadSaved';
        loadBtn.style.cssText = 'background: #8b5cf6; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; margin: 2px;';
        loadBtn.textContent = '📁 LOAD SAVED';
        
        const status = document.createElement('div');
        status.id = 'status';
        status.style.cssText = 'margin-top: 10px; font-size: 10px; color: #94a3b8;';
        status.textContent = 'Enhanced detection ready...';
        
        // Append all elements
        ui.appendChild(title);
        ui.appendChild(captureBtn);
        ui.appendChild(sensorsBtn);
        ui.appendChild(clipboardBtn);
        ui.appendChild(loadBtn);
        ui.appendChild(status);
        
        document.body.appendChild(ui);
        
        // Set up event listeners
        document.getElementById('captureAll').onclick = () => this.captureAllData();
        document.getElementById('startSensors').onclick = () => this.startSensorTracking();
        document.getElementById('copyToClipboard').onclick = () => this.copyToClipboard();
        document.getElementById('loadSaved').onclick = () => this.loadSavedData();
        
        console.log('✅ UI setup complete - persistent across refreshes');
    }
    
    // Auto-reinject UI on page navigation/refresh
    reinjectUI() {
        console.log('🔄 Re-injecting UI after page change...');
        this.setupUI();
    }
    
    // 1. ENHANCED VIEWPORT DETECTION WITH SVELTE-BROWSER ADVANCED FEATURES
    getEnhancedViewportData() {
        const vp = window.visualViewport;
        const DPI = window.devicePixelRatio || 1;
        const divDPI = 1 / DPI;
        
        // Advanced DPI calculations (from svelte-browser)
        const byDotCeil = (size) => Math.ceil(size * DPI) * divDPI;
        const byDotFloor = (size) => Math.floor(size * DPI) * divDPI;
        
        // Advanced zoom detection (svelte-browser style)
        const isZoomed = vp ? vp.scale > 1 : false;
        const zoomScale = vp ? vp.scale : 1;
        
        // Advanced area box calculations (svelte-browser AreaBox class)
        const zoomAreaBox = vp ? {
            size: [byDotCeil(vp.width), byDotCeil(vp.height)],
            point: [byDotCeil(vp.offsetLeft), byDotCeil(vp.offsetTop)],
            offset: [
                byDotCeil(vp.offsetTop),
                byDotFloor(window.innerWidth - vp.width - vp.offsetLeft),
                byDotFloor(window.innerHeight - vp.height - vp.offsetTop),
                byDotCeil(vp.offsetLeft)
            ]
        } : null;
        
        const viewAreaBox = vp ? {
            size: [byDotCeil(window.innerWidth), byDotCeil(window.innerHeight)],
            point: [byDotCeil(vp.pageLeft), byDotCeil(vp.pageTop)],
            offset: [
                byDotCeil(vp.pageTop),
                byDotFloor(document.body.clientWidth - vp.width - vp.pageLeft),
                byDotFloor(document.body.clientHeight - vp.height - vp.pageTop),
                byDotCeil(vp.pageLeft)
            ]
        } : null;
        
        // ENHANCED PAGE POSITION DETECTION (from svelte-browser library)
        const pagePosition = this.getAdvancedPagePosition();
        const elementPositions = this.getElementPositions();
        const scrollMetrics = this.getAdvancedScrollMetrics();
        const intersectionData = this.getIntersectionData();
        
        // Orientation detection (svelte-browser style)
        const isPortrait = window.innerWidth < window.innerHeight;
        const isLandscape = window.innerHeight < window.innerWidth;
        
        // iOS-specific zoom detection (from svelte-browser)
        let isIOSZoom = false;
        if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
            const { availHeight, availWidth } = window.screen;
            let screenWidth = availWidth;
            if ((window.innerWidth < window.innerHeight && availWidth < availHeight) ||
                (window.innerWidth > window.innerHeight && availWidth > availHeight)) {
                // correct orientation
            } else {
                screenWidth = availHeight; // swapped landscape
            }
            isIOSZoom = zoomScale > 1 || screenWidth < Math.floor(vp ? vp.width : window.innerWidth);
        }
        
        return {
            // Basic viewport
            basic: {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight,
                screenX: window.screenX,
                screenY: window.screenY,
                scrollX: window.scrollX,
                scrollY: window.scrollY,
                devicePixelRatio: DPI
            },
            
            // Visual viewport (svelte-browser enhanced)
            visualViewport: vp ? {
                width: vp.width,
                height: vp.height,
                offsetLeft: vp.offsetLeft,
                offsetTop: vp.offsetTop,
                pageLeft: vp.pageLeft,
                pageTop: vp.pageTop,
                scale: vp.scale
            } : null,
            
            // Advanced svelte-browser features
            svelteAdvanced: {
                // DPI calculations
                dpi: DPI,
                divDPI: divDPI,
                
                // Zoom detection
                isZoomed: isZoomed,
                isIOSZoom: isIOSZoom,
                zoomScale: zoomScale,
                
                // Orientation
                isPortrait: isPortrait,
                isLandscape: isLandscape,
                
                // Advanced area boxes
                zoomAreaBox: zoomAreaBox,
                viewAreaBox: viewAreaBox,
                
                // ENHANCED PAGE POSITION DATA
                pagePosition: pagePosition,
                elementPositions: elementPositions,
                scrollMetrics: scrollMetrics,
                intersectionData: intersectionData,
                
                // Precise measurements
                preciseWidth: byDotCeil(window.innerWidth),
                preciseHeight: byDotCeil(window.innerHeight),
                
                // Safe area (for mobile devices)
                safeArea: {
                    top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top')) || 0,
                    right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right')) || 0,
                    bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')) || 0,
                    left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left')) || 0
                },
                
                // Threshold calculations (from svelte-browser)
                threshold: [
                    Math.max(16, Math.ceil(0.05 * window.innerWidth)),
                    Math.max(16, Math.ceil(0.05 * window.innerHeight))
                ]
            }
        };
    }
    
    // ENHANCED PAGE POSITION DETECTION METHODS (from svelte-browser library)
    getAdvancedPagePosition() {
        const docElement = document.documentElement;
        const body = document.body;
        
        return {
            // Document dimensions
            documentWidth: Math.max(
                body.scrollWidth, body.offsetWidth,
                docElement.clientWidth, docElement.scrollWidth, docElement.offsetWidth
            ),
            documentHeight: Math.max(
                body.scrollHeight, body.offsetHeight,
                docElement.clientHeight, docElement.scrollHeight, docElement.offsetHeight
            ),
            
            // Page scroll position (multiple methods for accuracy)
            scrollPosition: {
                x: window.pageXOffset || docElement.scrollLeft || body.scrollLeft || 0,
                y: window.pageYOffset || docElement.scrollTop || body.scrollTop || 0,
                maxX: Math.max(0, (body.scrollWidth || docElement.scrollWidth) - window.innerWidth),
                maxY: Math.max(0, (body.scrollHeight || docElement.scrollHeight) - window.innerHeight)
            },
            
            // Viewport position relative to document
            viewportPosition: {
                left: window.pageXOffset || docElement.scrollLeft || body.scrollLeft || 0,
                top: window.pageYOffset || docElement.scrollTop || body.scrollTop || 0,
                right: (window.pageXOffset || docElement.scrollLeft || body.scrollLeft || 0) + window.innerWidth,
                bottom: (window.pageYOffset || docElement.scrollTop || body.scrollTop || 0) + window.innerHeight
            },
            
            // Page position ratios (0-1)
            scrollRatio: {
                x: this.calculateScrollRatio('x'),
                y: this.calculateScrollRatio('y')
            },
            
            // Reading position estimation
            readingPosition: this.estimateReadingPosition()
        };
    }
    
    getElementPositions() {
        const elements = [];
        
        // Get positions of key page elements
        const selectors = [
            'header', 'nav', 'main', 'article', 'section', 'aside', 'footer',
            'h1', 'h2', 'h3', '.header', '.navigation', '.content', '.sidebar',
            '[role="banner"]', '[role="navigation"]', '[role="main"]', '[role="complementary"]'
        ];
        
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                const rect = element.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(element);
                
                elements.push({
                    selector: selector,
                    tagName: element.tagName.toLowerCase(),
                    id: element.id || null,
                    className: element.className || null,
                    position: {
                        // Relative to viewport
                        viewport: {
                            left: rect.left,
                            top: rect.top,
                            right: rect.right,
                            bottom: rect.bottom,
                            width: rect.width,
                            height: rect.height
                        },
                        // Relative to document
                        document: {
                            left: rect.left + window.pageXOffset,
                            top: rect.top + window.pageYOffset,
                            right: rect.right + window.pageXOffset,
                            bottom: rect.bottom + window.pageYOffset
                        },
                        // CSS positioning info
                        css: {
                            position: computedStyle.position,
                            zIndex: computedStyle.zIndex,
                            display: computedStyle.display,
                            visibility: computedStyle.visibility,
                            opacity: computedStyle.opacity
                        }
                    },
                    // Visibility in viewport
                    visibility: {
                        isVisible: this.isElementVisible(element),
                        isInViewport: this.isElementInViewport(element),
                        visibleRatio: this.getElementVisibleRatio(element)
                    }
                });
            }
        });
        
        return elements;
    }
    
    getAdvancedScrollMetrics() {
        const docElement = document.documentElement;
        const body = document.body;
        
        // Current scroll position
        const scrollX = window.pageXOffset || docElement.scrollLeft || body.scrollLeft || 0;
        const scrollY = window.pageYOffset || docElement.scrollTop || body.scrollTop || 0;
        
        // Maximum scroll values
        const maxScrollX = Math.max(0, (body.scrollWidth || docElement.scrollWidth) - window.innerWidth);
        const maxScrollY = Math.max(0, (body.scrollHeight || docElement.scrollHeight) - window.innerHeight);
        
        return {
            current: { x: scrollX, y: scrollY },
            maximum: { x: maxScrollX, y: maxScrollY },
            percentage: {
                x: maxScrollX > 0 ? (scrollX / maxScrollX) * 100 : 0,
                y: maxScrollY > 0 ? (scrollY / maxScrollY) * 100 : 0
            },
            direction: this.getScrollDirection(),
            velocity: this.getScrollVelocity(),
            
            // Scroll behavior analysis
            behavior: {
                isAtTop: scrollY <= 10,
                isAtBottom: scrollY >= maxScrollY - 10,
                isAtLeft: scrollX <= 10,
                isAtRight: scrollX >= maxScrollX - 10,
                canScrollVertically: maxScrollY > 0,
                canScrollHorizontally: maxScrollX > 0
            },
            
            // Page sections in viewport
            sectionsInView: this.getSectionsInViewport()
        };
    }
    
    getIntersectionData() {
        // Use Intersection Observer API for precise visibility detection
        const intersectionData = {
            observedElements: [],
            viewportIntersections: [],
            rootMarginEffects: this.calculateRootMarginEffects()
        };
        
        // Find all elements with data attributes or important classes
        const observableElements = document.querySelectorAll(
            '[data-observe], .observe, .track-position, .lazy-load, img, video, iframe'
        );
        
        observableElements.forEach((element, index) => {
            if (index < 20) { // Limit to first 20 elements for performance
                const rect = element.getBoundingClientRect();
                const intersectionRatio = this.calculateIntersectionRatio(element);
                
                intersectionData.observedElements.push({
                    element: {
                        tagName: element.tagName.toLowerCase(),
                        id: element.id || null,
                        className: element.className || null,
                        src: element.src || null
                    },
                    intersection: {
                        ratio: intersectionRatio,
                        isIntersecting: intersectionRatio > 0,
                        boundingClientRect: {
                            top: rect.top,
                            left: rect.left,
                            bottom: rect.bottom,
                            right: rect.right,
                            width: rect.width,
                            height: rect.height
                        }
                    }
                });
            }
        });
        
        return intersectionData;
    }
    
    // Helper methods for position calculations
    calculateScrollRatio(axis) {
        const docElement = document.documentElement;
        const body = document.body;
        
        if (axis === 'x') {
            const scrollX = window.pageXOffset || docElement.scrollLeft || body.scrollLeft || 0;
            const maxScrollX = Math.max(0, (body.scrollWidth || docElement.scrollWidth) - window.innerWidth);
            return maxScrollX > 0 ? scrollX / maxScrollX : 0;
        } else {
            const scrollY = window.pageYOffset || docElement.scrollTop || body.scrollTop || 0;
            const maxScrollY = Math.max(0, (body.scrollHeight || docElement.scrollHeight) - window.innerHeight);
            return maxScrollY > 0 ? scrollY / maxScrollY : 0;
        }
    }
    
    estimateReadingPosition() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const windowHeight = window.innerHeight;
        const documentHeight = Math.max(
            document.body.scrollHeight, document.body.offsetHeight,
            document.documentElement.clientHeight, document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        
        const readingLine = scrollY + (windowHeight * 0.3); // Assume reading at 30% down the viewport
        const readingProgress = Math.min(readingLine / documentHeight, 1);
        
        return {
            readingLine: readingLine,
            progress: readingProgress,
            estimatedTimeRemaining: this.estimateReadingTime(documentHeight - readingLine),
            currentSection: this.getCurrentSection(readingLine)
        };
    }
    
    isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               parseFloat(style.opacity) > 0;
    }
    
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && 
               rect.bottom > 0 && 
               rect.left < window.innerWidth && 
               rect.right > 0;
    }
    
    getElementVisibleRatio(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);
        
        if (visibleHeight <= 0 || visibleWidth <= 0) return 0;
        
        const visibleArea = visibleHeight * visibleWidth;
        const totalArea = rect.height * rect.width;
        
        return totalArea > 0 ? visibleArea / totalArea : 0;
    }
    
    getScrollDirection() {
        // This would need to track previous scroll positions
        return this.scrollDirection || { x: 0, y: 0 };
    }
    
    getScrollVelocity() {
        // This would need to track scroll timing
        return this.scrollVelocity || { x: 0, y: 0 };
    }
    
    getSectionsInViewport() {
        const sections = document.querySelectorAll('section, article, .section, [role="region"]');
        const sectionsInView = [];
        
        sections.forEach((section, index) => {
            if (this.isElementInViewport(section)) {
                sectionsInView.push({
                    index: index,
                    id: section.id || null,
                    className: section.className || null,
                    visibleRatio: this.getElementVisibleRatio(section)
                });
            }
        });
        
        return sectionsInView;
    }
    
    calculateRootMarginEffects() {
        // Calculate how different root margins would affect intersection
        const margins = ['0px', '50px', '100px', '200px'];
        return margins.map(margin => ({
            margin: margin,
            // This would need actual Intersection Observer implementation
            estimatedEffect: 'Elements would intersect ' + margin + ' earlier'
        }));
    }
    
    calculateIntersectionRatio(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calculate intersection area
        const intersectionTop = Math.max(0, rect.top);
        const intersectionLeft = Math.max(0, rect.left);
        const intersectionBottom = Math.min(viewportHeight, rect.bottom);
        const intersectionRight = Math.min(viewportWidth, rect.right);
        
        const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);
        const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);
        const intersectionArea = intersectionHeight * intersectionWidth;
        
        const elementArea = rect.width * rect.height;
        
        return elementArea > 0 ? intersectionArea / elementArea : 0;
    }
    
    estimateReadingTime(remainingHeight) {
        // Rough estimate: 200 pixels per second reading speed
        const readingSpeed = 200;
        return remainingHeight > 0 ? Math.ceil(remainingHeight / readingSpeed) : 0;
    }
    
    getCurrentSection(readingLine) {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let currentSection = null;
        
        headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            const headingTop = rect.top + window.pageYOffset;
            
            if (headingTop <= readingLine) {
                currentSection = {
                    text: heading.textContent.trim(),
                    level: parseInt(heading.tagName.substring(1)),
                    id: heading.id || null
                };
            }
        });
        
        return currentSection;
    }
    
    // 2. ADVANCED DEVICE INFO (from svelte-browser)
    getAdvancedDeviceInfo() {
        const ua = navigator.userAgent;
        
        return {
            // Device type detection (svelte-browser style)
            isPC: !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)),
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
            isTablet: /iPad|Android/i.test(ua) && window.innerWidth > 768,
            isIOS: /iPhone|iPad|iPod/i.test(ua),
            isAndroid: /Android/i.test(ua),
            
            // Browser detection
            isBlink: /Chrome|Chromium|Edge/i.test(ua),
            isWebkit: /Safari/i.test(ua) && !/Chrome/i.test(ua),
            isMacSafari: /Safari/i.test(ua) && /Mac/i.test(ua) && !/Chrome/i.test(ua),
            
            // Feature detection (svelte-browser legacy check)
            isLegacy: !window.VisualViewport || !window.ResizeObserver || !window.IntersectionObserver,
            
            // Capabilities
            touchSupport: 'ontouchstart' in window,
            orientationSupport: 'orientation' in screen,
            geolocationSupport: 'geolocation' in navigator,
            gamepadSupport: 'getGamepads' in navigator,
            
            // Platform info
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }
    
    // 3. SENSOR DATA (Gyroscope, Accelerometer, etc.)
    async startSensorTracking() {
        console.log('🧭 Starting sensor tracking...');
        
        // Geolocation
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.data.geolocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        altitude: position.coords.altitude,
                        accuracy: position.coords.accuracy,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: position.timestamp
                    };
                    console.log('📍 Geolocation:', this.data.geolocation);
                },
                (error) => console.log('❌ Geolocation error:', error.message)
            );
        }
        
        // Device orientation (gyroscope)
        if ('DeviceOrientationEvent' in window) {
            window.addEventListener('deviceorientation', (event) => {
                this.data.gyroscope = {
                    alpha: event.alpha, // Z-axis rotation
                    beta: event.beta,   // X-axis rotation
                    gamma: event.gamma, // Y-axis rotation
                    absolute: event.absolute
                };
                console.log('🧭 Gyroscope:', this.data.gyroscope);
            });
        }
        
        // Device motion (accelerometer)
        if ('DeviceMotionEvent' in window) {
            window.addEventListener('devicemotion', (event) => {
                this.data.accelerometer = {
                    acceleration: event.acceleration,
                    accelerationIncludingGravity: event.accelerationIncludingGravity,
                    rotationRate: event.rotationRate,
                    interval: event.interval
                };
                console.log('📐 Accelerometer:', this.data.accelerometer);
            });
        }
        
        document.getElementById('status').textContent = 'Sensor tracking started...';
    }
    
    // 4. COPY TO CLIPBOARD FUNCTIONALITY
    copyToClipboard() {
        console.log('📋 Copying viewport data to clipboard...');
        
        // Get the latest viewport data
        const currentData = this.getEnhancedViewportData();
        const timestamp = new Date().toLocaleTimeString();
        
        const clipboardData = {
            timestamp,
            viewport: currentData,
            device: this.getAdvancedDeviceInfo(),
            audio: this.getAudioContextInfo(),
            performance: this.getPerformanceData(),
            sensors: {
                geolocation: this.data.geolocation || null,
                gyroscope: this.data.gyroscope || null,
                accelerometer: this.data.accelerometer || null
            }
        };
        
        const jsonString = JSON.stringify(clipboardData, null, 2);
        
        // Copy to clipboard using modern API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(jsonString).then(() => {
                console.log('✅ Viewport data copied to clipboard successfully!');
                document.getElementById('status').textContent = \`📋 Data copied to clipboard at \${timestamp}\`;
            }).catch(err => {
                console.error('❌ Failed to copy to clipboard:', err);
                this.fallbackCopyToClipboard(jsonString, timestamp);
            });
        } else {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(jsonString, timestamp);
        }
    }
    
    // Fallback copy method for older browsers
    fallbackCopyToClipboard(text, timestamp) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('✅ Viewport data copied to clipboard (fallback method)!');
                document.getElementById('status').textContent = \`📋 Data copied to clipboard at \${timestamp}\`;
            } else {
                console.error('❌ Fallback copy failed');
                document.getElementById('status').textContent = 'Failed to copy to clipboard';
            }
        } catch (err) {
            console.error('❌ Copy operation failed:', err);
            document.getElementById('status').textContent = 'Copy to clipboard not supported';
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    // 5. AUDIO CONTEXT FEATURES
    getAudioContextInfo() {
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            
            return {
                sampleRate: audioContext.sampleRate,
                state: audioContext.state,
                baseLatency: audioContext.baseLatency,
                outputLatency: audioContext.outputLatency,
                destination: {
                    channelCount: audioContext.destination.channelCount,
                    channelCountMode: audioContext.destination.channelCountMode,
                    channelInterpretation: audioContext.destination.channelInterpretation
                }
            };
        }
        return null;
    }
    
    // 6. PERFORMANCE MONITORING
    getPerformanceData() {
        return {
            memory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null,
            
            timing: {
                navigationStart: performance.timing.navigationStart,
                loadEventEnd: performance.timing.loadEventEnd,
                domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd,
                responseEnd: performance.timing.responseEnd
            },
            
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : null
        };
    }
    
    // CAPTURE ALL DATA
    captureAllData() {
        const timestamp = new Date().toLocaleTimeString();
        
        const allData = {
            timestamp,
            viewport: this.getEnhancedViewportData(),
            device: this.getAdvancedDeviceInfo(),
            audio: this.getAudioContextInfo(),
            performance: this.getPerformanceData(),
            sensors: {
                geolocation: this.data.geolocation || null,
                gyroscope: this.data.gyroscope || null,
                accelerometer: this.data.accelerometer || null
            },
            gamepads: this.data.gamepads || []
        };
        
        console.log('📊 COMPLETE ENHANCED DETECTION - ' + timestamp);
        console.log('='.repeat(80));
        
        // Log all sections with detailed formatting
        Object.keys(allData).forEach(section => {
            if (section !== 'timestamp') {
                console.log(\`🔍 \${section.toUpperCase()}:\`);
                console.log(JSON.stringify(allData[section], null, 2));
                console.log('-'.repeat(40));
            }
        });
        
        console.log('='.repeat(80));
        
        // Save data to browser storage for file saving
        window.enhancedDetectionData = allData;
        
        // Trigger file save
        this.saveDataToFile(allData);
        
        document.getElementById('status').textContent = \`Complete capture at \${timestamp} - SAVED TO FILE\`;
        
        return allData;
    }
    
    // Save data to downloadable file
    saveDataToFile(data) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'browser-state-data.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('💾 Browser state data saved to browser-state-data.txt');
        console.log('📁 File contains all viewport, device, audio, performance data for exact restoration');
    }
    
    // Load saved data functionality (browser-side)
    loadSavedData() {
        console.log('📁 Load Saved Data clicked - please upload browser-state-data.txt file');
        
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.json';
        fileInput.style.display = 'none';
        
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const savedData = JSON.parse(e.target.result);
                        console.log('📁 Loaded saved browser state data:');
                        console.log('⏰ Saved at:', savedData.timestamp);
                        console.log('📊 Data includes:', Object.keys(savedData).join(', '));
                        
                        this.restoreBrowserState(savedData);
                        
                        document.getElementById('status').textContent = \`Loaded data from \${savedData.timestamp}\`;
                    } catch (error) {
                        console.error('❌ Error loading saved data:', error);
                        document.getElementById('status').textContent = 'Error loading saved data';
                    }
                };
                reader.readAsText(file);
            }
        };
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }
    
    // Restore browser state from loaded data
    restoreBrowserState(savedData) {
        if (!savedData || !savedData.viewport) {
            console.log('⚠️ No valid viewport data to restore');
            return;
        }
        
        const viewport = savedData.viewport;
        const basic = viewport.basic || {};
        const visual = viewport.visualViewport || {};
        
        console.log('🔄 RESTORING BROWSER STATE FROM LOADED DATA:');
        console.log('📊 Original data:', JSON.stringify(viewport, null, 2));
        
        // Force scroll to exact position with multiple methods
        if (basic.scrollX !== undefined && basic.scrollY !== undefined) {
            // Method 1: Standard scrollTo
            window.scrollTo(basic.scrollX, basic.scrollY);
            
            // Method 2: Smooth scroll
            window.scrollTo({
                left: basic.scrollX,
                top: basic.scrollY,
                behavior: 'smooth'
            });
            
            // Method 3: Document element scroll
            document.documentElement.scrollLeft = basic.scrollX;
            document.documentElement.scrollTop = basic.scrollY;
            
            // Method 4: Body scroll
            document.body.scrollLeft = basic.scrollX;
            document.body.scrollTop = basic.scrollY;
            
            console.log(\`📜 Scroll restored to: \${basic.scrollX}, \${basic.scrollY}\`);
            
            // Verify scroll position
            setTimeout(() => {
                const currentScrollX = window.scrollX || window.pageXOffset;
                const currentScrollY = window.scrollY || window.pageYOffset;
                console.log(\`✅ Current scroll after restore: \${currentScrollX}, \${currentScrollY}\`);
                
                if (Math.abs(currentScrollX - basic.scrollX) > 5 || Math.abs(currentScrollY - basic.scrollY) > 5) {
                    console.log('⚠️ Scroll position not exactly restored, trying again...');
                    window.scrollTo(basic.scrollX, basic.scrollY);
                }
            }, 1000);
        }
        
        // Restore zoom level with CSS zoom
        if (visual.scale && visual.scale !== 1) {
            // Method 1: CSS zoom on body
            document.body.style.zoom = visual.scale;
            
            // Method 2: CSS transform scale on html
            document.documentElement.style.transform = \`scale(\${visual.scale})\`;
            document.documentElement.style.transformOrigin = 'top left';
            
            console.log(\`🔎 Zoom restored to: \${visual.scale}\`);
        }
        
        // Save to localStorage for server-side restoration on next launch
        localStorage.setItem('savedBrowserState', JSON.stringify(savedData));
        console.log('💾 Saved to localStorage for next browser launch');
        
        console.log('✅ Browser state restoration completed!');
        console.log('📝 Note: Window size/position require server restart for full restoration');
        
        // Show visual confirmation
        document.getElementById('status').innerHTML = \`
            ✅ RESTORED: Scroll(\${basic.scrollX},\${basic.scrollY}) Zoom(\${visual.scale || 1}x)
        \`;
    }
}

// Initialize enhanced detection
window.enhancedDetection = new EnhancedSvelteBrowserDetection();
console.log('✅ Enhanced Svelte-Browser detection system initialized');
`;

// Load saved browser state data
function loadSavedBrowserState() {
    try {
        if (fs.existsSync(SAVE_FILE)) {
            const savedData = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
            console.log('📁 Found saved browser state data!');
            console.log('⏰ Saved at:', savedData.timestamp);
            console.log('📊 Data includes:', Object.keys(savedData).join(', '));
            return savedData;
        }
    } catch (error) {
        console.log('⚠️ Could not load saved data:', error.message);
    }
    return null;
}

// Extract browser launch configuration from saved data
function getBrowserConfigFromSavedData(savedData) {
    if (!savedData || !savedData.viewport) {
        return {
            windowSize: '964,636',
            windowPosition: '268,64',
            devicePixelRatio: 1,
            scrollX: 0,
            scrollY: 0,
            zoom: 1
        };
    }
    
    const viewport = savedData.viewport;
    const basic = viewport.basic || {};
    const visual = viewport.visualViewport || {};
    
    return {
        windowSize: `${basic.outerWidth || 964},${basic.outerHeight || 636}`,
        windowPosition: `${basic.screenX || 268},${basic.screenY || 64}`,
        devicePixelRatio: basic.devicePixelRatio || 1,
        scrollX: basic.scrollX || 0,
        scrollY: basic.scrollY || 0,
        zoom: visual.scale || 1,
        innerSize: `${basic.innerWidth || 964},${basic.innerHeight || 636}`
    };
}

async function startEnhancedDetection() {
    console.log('🌐 Launching enhanced svelte-browser detection...');
    
    // Load saved browser state (same as puppeteer-exact-viewport.js)
    const savedData = loadSavedBrowserState();
    const config = getBrowserConfigFromSavedData(savedData);
    
    if (savedData) {
        console.log('🔄 RESTORING BROWSER STATE:');
        console.log(`   📐 Window Size: ${config.windowSize}`);
        console.log(`   📍 Window Position: ${config.windowPosition}`);
        console.log(`   🔍 Device Pixel Ratio: ${config.devicePixelRatio}`);
        console.log(`   📜 Scroll Position: ${config.scrollX}, ${config.scrollY}`);
        console.log(`   🔎 Zoom Level: ${config.zoom}`);
        console.log('='.repeat(70));
    } else {
        console.log('📋 No saved data found - using default configuration');
    }
    
    let browser, page;
    
    try {
        // Use same browser launch configuration as puppeteer-exact-viewport.js
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null, // Let browser determine viewport based on window size
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                `--window-size=${config.windowSize}`,
                `--window-position=${config.windowPosition}`,
                `--force-device-scale-factor=${config.devicePixelRatio}`,
                '--user-data-dir=./chrome-data-viewport-detection' // Separate user data dir for viewport detection
            ]
        });
        
        page = await browser.newPage();
        
        page.on('console', msg => {
            console.log(`🌐 BROWSER: ${msg.text()}`);
        });
        
        console.log('🌐 Navigating to target website...');
        await page.goto(TEST_URL, { waitUntil: 'networkidle0', timeout: 60000 });
        
        console.log('🔧 Injecting enhanced detection system...');
        await page.evaluate(ENHANCED_DETECTION_SCRIPT);
        
        // Add persistent script injection that survives page refreshes
        await page.evaluateOnNewDocument(() => {
            // Re-inject the detection system on every page load/refresh
            document.addEventListener('DOMContentLoaded', () => {
                console.log('🔄 DOMContentLoaded - Re-injecting detection system...');
                if (!window.enhancedDetection) {
                    // Re-create the detection system if it doesn't exist
                    setTimeout(() => {
                        if (!window.enhancedDetection) {
                            console.log('🔄 Creating new detection system after page reload...');
                            window.enhancedDetection = new EnhancedSvelteBrowserDetection();
                        }
                    }, 1000);
                }
            });
        });
        
        // Also inject the detection class definition on every new document
        await page.evaluateOnNewDocument(ENHANCED_DETECTION_SCRIPT);
        
        // Restore scroll position and zoom if saved data exists
        if (savedData) {
            console.log('🔄 Restoring scroll position and zoom...');
            
            await page.evaluate((config) => {
                // Restore scroll position with multiple methods
                if (config.scrollX !== undefined && config.scrollY !== undefined) {
                    // Method 1: Standard scrollTo
                    window.scrollTo(config.scrollX, config.scrollY);
                    
                    // Method 2: Document element scroll
                    document.documentElement.scrollLeft = config.scrollX;
                    document.documentElement.scrollTop = config.scrollY;
                    
                    // Method 3: Body scroll
                    document.body.scrollLeft = config.scrollX;
                    document.body.scrollTop = config.scrollY;
                    
                    console.log(`📜 Scroll restored to: ${config.scrollX}, ${config.scrollY}`);
                    
                    // Verify and retry if needed
                    setTimeout(() => {
                        const currentScrollX = window.scrollX || window.pageXOffset;
                        const currentScrollY = window.scrollY || window.pageYOffset;
                        if (Math.abs(currentScrollX - config.scrollX) > 5 || Math.abs(currentScrollY - config.scrollY) > 5) {
                            window.scrollTo(config.scrollX, config.scrollY);
                            console.log(`🔄 Scroll position corrected to: ${config.scrollX}, ${config.scrollY}`);
                        }
                    }, 500);
                }
                
                // Restore zoom level with CSS zoom
                if (config.zoom !== 1) {
                    // Method 1: CSS zoom on body
                    document.body.style.zoom = config.zoom;
                    
                    // Method 2: CSS transform scale on html
                    document.documentElement.style.transform = `scale(${config.zoom})`;
                    document.documentElement.style.transformOrigin = 'top left';
                    
                    console.log(`🔎 Zoom restored to: ${config.zoom}`);
                }
                
            }, config);
            
            console.log('✅ Browser state fully restored from saved data!');
        }
        
        // Also check for localStorage saved data from previous browser session
        await page.evaluate(() => {
            const localStorageData = localStorage.getItem('savedBrowserState');
            if (localStorageData) {
                try {
                    const data = JSON.parse(localStorageData);
                    console.log('🔄 Found localStorage saved data from previous session');
                    console.log('⏰ Previous session data from:', data.timestamp);
                    
                    // Apply localStorage data if no file-based data was loaded
                    if (!window.enhancedDetectionData) {
                        const viewport = data.viewport;
                        const basic = viewport.basic || {};
                        const visual = viewport.visualViewport || {};
                        
                        if (basic.scrollX !== undefined && basic.scrollY !== undefined) {
                            window.scrollTo(basic.scrollX, basic.scrollY);
                            console.log(`📜 Applied localStorage scroll: ${basic.scrollX}, ${basic.scrollY}`);
                        }
                        
                        if (visual.scale && visual.scale !== 1) {
                            document.body.style.zoom = visual.scale;
                            console.log(`🔎 Applied localStorage zoom: ${visual.scale}`);
                        }
                    }
                } catch (e) {
                    console.log('⚠️ Error parsing localStorage data:', e.message);
                }
            }
        });
        
        console.log('='.repeat(70));
        console.log('🚀 ENHANCED SVELTE-BROWSER DETECTION ACTIVE!');
        console.log('='.repeat(70));
        console.log('🎮 FEATURES AVAILABLE:');
        console.log('   📊 CAPTURE ALL - Complete viewport + sensors + gamepad data');
        console.log('   🧭 START SENSORS - GPS, gyroscope, accelerometer tracking');
        console.log('   🎮 GAMEPAD - PlayStation/Xbox controller detection');
        console.log('   🔊 Audio context analysis');
        console.log('   📱 Advanced device detection');
        console.log('   ⚡ Performance monitoring');
        console.log('='.repeat(70));
        
        // CRITICAL: Continuous UI monitoring and re-injection
        console.log('🔄 Starting continuous UI monitoring...');
        const uiMonitorInterval = setInterval(async () => {
            try {
                // Check if UI exists on the page
                const uiExists = await page.evaluate(() => {
                    return !!document.getElementById('enhanced-svelte-ui');
                });
                
                if (!uiExists) {
                    console.log('🔄 UI missing - re-injecting enhanced detection script...');
                    
                    // Check if class already exists, if not, inject the script
                    const classExists = await page.evaluate(() => {
                        return typeof EnhancedSvelteBrowserDetection !== 'undefined';
                    });
                    
                    if (!classExists) {
                        // Re-inject the entire detection script
                        await page.evaluate(ENHANCED_DETECTION_SCRIPT);
                    }
                    
                    // Initialize the detection system
                    await page.evaluate(() => {
                        if (!window.enhancedDetection) {
                            window.enhancedDetection = new EnhancedSvelteBrowserDetection();
                        }
                    });
                    
                    console.log('✅ UI re-injected successfully!');
                }
            } catch (error) {
                console.log('⚠️ UI monitoring error:', error.message);
            }
        }, 3000); // Check every 3 seconds
        
        await new Promise(resolve => {
            process.on('SIGINT', () => {
                console.log('\n🛑 Closing enhanced detection...');
                clearInterval(uiMonitorInterval);
                resolve();
            });
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

startEnhancedDetection().catch(console.error);
