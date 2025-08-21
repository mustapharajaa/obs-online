const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Launch browser with EXACT viewport control using Puppeteer
async function launchExactViewport() {
    const targetUrl = 'https://www.aiscore.com/match-shan-united-svay-rieng-fc/ezk96i3o9wrh1kn';
    const exactPosition = {
        windowWidth: 964,
        windowHeight: 636,
        positionX: 268,
        positionY: 64,
        scrollX: 49,
        scrollY: 459
    };

    console.log('🚀 Launching Puppeteer with EXACT POSITION & SCROLL...');
    console.log(`📱 Target URL: ${targetUrl}`);
    console.log(`🪟 Window Size: ${exactPosition.windowWidth}x${exactPosition.windowHeight}`);
    console.log(`📍 Position: X=${exactPosition.positionX}, Y=${exactPosition.positionY}`);
    console.log(`📜 Scroll: X=${exactPosition.scrollX}, Y=${exactPosition.scrollY}`);

    let browser;
    try {
        // Launch browser with precise POSITION and WINDOW SIZE (same as RTMP server)
        browser = await puppeteer.launch({
            headless: false, // Show the browser window
            defaultViewport: null, // Let browser determine viewport based on window size
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                `--window-size=${exactPosition.windowWidth},${exactPosition.windowHeight}`,
                `--window-position=${exactPosition.positionX},${exactPosition.positionY}`,
                '--user-data-dir=./chrome-data-test' // Separate user data for test
            ]
        });

        const page = await browser.newPage();

        // Don't set viewport - let it be determined by window size

        // Load cookies if available
        const cookiesPath = path.join(__dirname, 'cookies.json');
        if (fs.existsSync(cookiesPath)) {
            console.log('🍪 Loading cookies...');
            const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
            
            // Filter cookies for aiscore.com domain
            const aiscoreCookies = cookies.filter(cookie => 
                cookie.domain === 'www.aiscore.com' || 
                cookie.domain === '.aiscore.com' || 
                cookie.domain === 'aiscore.com'
            );
            
            if (aiscoreCookies.length > 0) {
                await page.setCookie(...aiscoreCookies);
                console.log(`✅ Set ${aiscoreCookies.length} cookies for aiscore.com`);
            }
        }

        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navigate to the match page
        console.log('🌐 Navigating to match page...');
        await page.goto(targetUrl, {
            waitUntil: 'networkidle0',
            timeout: 120000
        });

        // Set exact scroll position
        console.log('📜 Setting exact scroll position...');
        await page.evaluate((scrollX, scrollY) => {
            window.scrollTo(scrollX, scrollY);
        }, exactPosition.scrollX, exactPosition.scrollY);

        // No zoom applied - keep natural 100% view
        console.log('✅ Keeping natural 100% zoom for full-size view...');
        
        // Force full viewport usage with aggressive CSS
        console.log('🔧 Forcing full viewport usage...');
        await page.evaluate(() => {
            // Force HTML and body to use full viewport dimensions with !important
            document.documentElement.style.cssText = 'margin:0!important;padding:0!important;width:100%!important;height:100%!important;box-sizing:border-box!important;border:none!important;outline:none!important;';
            document.body.style.cssText = 'margin:0!important;padding:0!important;width:100%!important;height:100%!important;box-sizing:border-box!important;border:none!important;outline:none!important;';
            
            // Force recalculation
            window.dispatchEvent(new Event('resize'));
            
            // Log the results
            console.log('✅ FORCED full viewport usage with !important styles');
            console.log('📏 HTML Client:', document.documentElement.clientWidth + 'x' + document.documentElement.clientHeight);
            console.log('📱 Viewport:', window.innerWidth + 'x' + window.innerHeight);
            console.log('🎯 Match:', (document.documentElement.clientWidth === window.innerWidth && document.documentElement.clientHeight === window.innerHeight) ? 'PERFECT' : 'STILL DIFFERENT');
        });

        // Run comprehensive page parameter detection
        console.log('🔍 Running comprehensive page parameter detection...');
        await page.evaluate(() => {
            console.log('🔍 COMPREHENSIVE PAGE PARAMETER DETECTION:');
            console.log('='.repeat(60));
            console.log('📱 VIEWPORT & WINDOW:');
            console.log('   Viewport (inner):', window.innerWidth + 'x' + window.innerHeight);
            console.log('   Window (outer):', window.outerWidth + 'x' + window.outerHeight);
            console.log('   Position X,Y:', window.screenX + ',' + window.screenY);
            console.log('📜 SCROLL PARAMETERS:');
            console.log('   Current Scroll X,Y:', window.scrollX + ',' + window.scrollY);
            console.log('   Page Size:', document.documentElement.scrollWidth + 'x' + document.documentElement.scrollHeight);
            console.log('   Max Scroll:', (document.documentElement.scrollWidth - window.innerWidth) + ',' + (document.documentElement.scrollHeight - window.innerHeight));
            console.log('🔍 ZOOM & SCALING:');
            console.log('   Device Pixel Ratio:', window.devicePixelRatio);
            console.log('   Zoom Level:', Math.round(window.devicePixelRatio * 100) + '%');
            console.log('   Body Zoom Style:', document.body.style.zoom || 'none');
            console.log('   Body Transform:', document.body.style.transform || 'none');
            console.log('   Computed Body Zoom:', window.getComputedStyle(document.body).zoom || 'auto');
            console.log('   HTML Zoom:', document.documentElement.style.zoom || 'none');
            console.log('📐 ELEMENT SIZES:');
            console.log('   Body Client:', document.body.clientWidth + 'x' + document.body.clientHeight);
            console.log('   Body Offset:', document.body.offsetWidth + 'x' + document.body.offsetHeight);
            console.log('   Body Scroll:', document.body.scrollWidth + 'x' + document.body.scrollHeight);
            console.log('   HTML Client:', document.documentElement.clientWidth + 'x' + document.documentElement.clientHeight);
            console.log('🎯 CSS PROPERTIES:');
            const bodyStyle = window.getComputedStyle(document.body);
            console.log('   Font Size:', bodyStyle.fontSize);
            console.log('   Line Height:', bodyStyle.lineHeight);
            console.log('   Transform:', bodyStyle.transform);
            console.log('   Scale:', bodyStyle.scale || 'none');
            console.log('📊 SCREEN INFO:');
            console.log('   Screen Resolution:', screen.width + 'x' + screen.height);
            console.log('   Available Screen:', screen.availWidth + 'x' + screen.availHeight);
            console.log('   Color Depth:', screen.colorDepth + ' bits');
            console.log('   Pixel Depth:', screen.pixelDepth + ' bits');
            console.log('🌐 BROWSER INFO:');
            console.log('   User Agent:', navigator.userAgent.substring(0, 100) + '...');
            console.log('   Platform:', navigator.platform);
            console.log('   Language:', navigator.language);
            console.log('='.repeat(60));
        });

        // Verify position, size, and scroll
        const actualState = await page.evaluate(() => {
            return {
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                window: {
                    width: window.outerWidth,
                    height: window.outerHeight,
                    x: window.screenX,
                    y: window.screenY
                },
                scroll: {
                    x: window.scrollX,
                    y: window.scrollY
                }
            };
        });

        console.log('✅ Browser launched successfully!');
        console.log('📊 COMPLETE VERIFICATION:');
        console.log(`   🪟 Window Size - Requested: ${exactPosition.windowWidth}x${exactPosition.windowHeight} | Actual: ${actualState.window.width}x${actualState.window.height}`);
        console.log(`   📍 Position - Requested: ${exactPosition.positionX},${exactPosition.positionY} | Actual: ${actualState.window.x},${actualState.window.y}`);
        console.log(`   📜 Scroll - Requested: ${exactPosition.scrollX},${exactPosition.scrollY} | Actual: ${actualState.scroll.x},${actualState.scroll.y}`);
        console.log(`   📱 Viewport: ${actualState.viewport.width}x${actualState.viewport.height}`);
        
        const sizeMatch = actualState.window.width === exactPosition.windowWidth && actualState.window.height === exactPosition.windowHeight;
        const positionMatch = actualState.window.x === exactPosition.positionX && actualState.window.y === exactPosition.positionY;
        const scrollMatch = Math.abs(actualState.scroll.x - exactPosition.scrollX) < 1 && Math.abs(actualState.scroll.y - exactPosition.scrollY) < 1;
        
        if (sizeMatch && positionMatch && scrollMatch) {
            console.log('🎯 PERFECT! All parameters match exactly!');
        } else {
            console.log('⚠️ Some parameters differ:');
            if (!sizeMatch) console.log('   - Window size differs');
            if (!positionMatch) console.log('   - Position differs');
            if (!scrollMatch) console.log('   - Scroll position differs');
        }

        // Add window info overlay
        await page.evaluate((target, actual) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 14px;
                z-index: 999999;
                pointer-events: none;
                line-height: 1.4;
            `;
            overlay.innerHTML = `
                <div>Target Window: ${target.width}×${target.height}</div>
                <div>Actual Window: ${actual.outerWidth}×${actual.outerHeight}</div>
                <div>Viewport: ${actual.width}×${actual.height}</div>
                <div>Status: ${actual.outerWidth === target.width && actual.outerHeight === target.height ? '✅ EXACT' : '⚠️ DIFF'}</div>
            `;
            document.body.appendChild(overlay);
            
            // Remove overlay after 10 seconds
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 10000);
        }, exactPosition, actualState);

        console.log('');
        console.log('🎯 Match page loaded with EXACT viewport!');
        console.log('💡 Tips:');
        console.log('   - Viewport is precisely controlled by Puppeteer');
        console.log('   - Refresh the page to get latest match updates');
        console.log('   - Press Ctrl+C in terminal to close browser');
        console.log('');

        // Keep the browser open
        console.log('🔄 Browser is running... Press Ctrl+C to close');
        
        // Set up file monitoring for real-time viewport updates
        const stateFilePath = path.join(__dirname, 'browser-state-data.txt');
        let fileWatcher = null;
        
        console.log('👁️ Setting up file monitoring for real-time viewport updates...');
        console.log(`📁 Monitoring: ${stateFilePath}`);
        
        const updateViewportFromFile = async () => {
            try {
                if (fs.existsSync(stateFilePath)) {
                    // Add delay to ensure file write is complete
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const fileContent = fs.readFileSync(stateFilePath, 'utf8');
                    const stateData = JSON.parse(fileContent);
                    
                    console.log('🔍 Parsing state data for viewport updates...');
                    
                    // Check for scroll data in the correct structure: viewport.basic.scrollX/scrollY
                    if (stateData.viewport && stateData.viewport.basic) {
                        const newScrollX = stateData.viewport.basic.scrollX || 0;
                        const newScrollY = stateData.viewport.basic.scrollY || 0;
                        
                        console.log(`📜 Updating scroll position: ${newScrollX}, ${newScrollY}`);
                        
                        // Update scroll position with multiple methods for reliability
                        await page.evaluate((scrollX, scrollY) => {
                            console.log(`Browser: Applying scroll ${scrollX}, ${scrollY}`);
                            window.scrollTo(scrollX, scrollY);
                            document.documentElement.scrollLeft = scrollX;
                            document.documentElement.scrollTop = scrollY;
                            document.body.scrollLeft = scrollX;
                            document.body.scrollTop = scrollY;
                        }, newScrollX, newScrollY);
                        
                        // Verify the scroll update
                        const actualScroll = await page.evaluate(() => ({
                            x: window.scrollX || window.pageXOffset,
                            y: window.scrollY || window.pageYOffset
                        }));
                        
                        console.log(`✅ Scroll updated - Target: ${newScrollX},${newScrollY} | Actual: ${actualScroll.x},${actualScroll.y}`);
                    } else {
                        console.log('⚠️ No viewport.basic scroll data found in state file');
                    }
                    
                    // Check for zoom data (if present)
                    if (stateData.zoom && stateData.zoom.level !== undefined) {
                        const zoomLevel = stateData.zoom.level;
                        console.log(`🔍 Updating zoom level: ${zoomLevel}`);
                        
                        await page.evaluate((zoom) => {
                            document.body.style.zoom = zoom;
                        }, zoomLevel);
                        
                        console.log(`✅ Zoom updated to: ${zoomLevel}`);
                    }
                }
            } catch (error) {
                console.error('❌ Error updating viewport from file:', error.message);
                console.error('Stack trace:', error.stack);
            }
        };
        
        // Set up file watcher
        try {
            fileWatcher = fs.watch(stateFilePath, { persistent: true }, (eventType, filename) => {
                if (eventType === 'change') {
                    console.log(`📁 File changed: ${filename}`);
                    updateViewportFromFile();
                }
            });
            console.log('✅ File watcher established for real-time updates');
        } catch (error) {
            console.error('❌ Error setting up file watcher:', error.message);
        }
        
        // Handle process termination
        process.on('SIGINT', async () => {
            console.log('\n🛑 Closing browser and cleaning up...');
            
            // Close file watcher
            if (fileWatcher) {
                fileWatcher.close();
                console.log('✅ File watcher closed');
            }
            
            if (browser) {
                await browser.close();
            }
            process.exit(0);
        });

        // Keep the script running
        await new Promise(() => {}); // Run indefinitely until Ctrl+C

    } catch (error) {
        console.error('❌ Error launching browser:', error.message);
        if (error.message.includes('Could not find Chrome')) {
            console.log('💡 Chrome is still downloading. Please wait for download to complete and try again.');
        }
        if (browser) {
            await browser.close();
        }
        process.exit(1);
    }
}

// Run the launcher
if (require.main === module) {
    launchExactViewport();
}

module.exports = launchExactViewport;
