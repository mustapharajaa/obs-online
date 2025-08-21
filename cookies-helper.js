// Cookies Helper Utility for Puppeteer Browser Authentication
const fs = require('fs');
const path = require('path');

class CookiesHelper {
    constructor(cookiesFilePath = './cookies.json') {
        this.cookiesFilePath = cookiesFilePath;
    }

    // Load cookies from file
    loadCookies() {
        try {
            if (fs.existsSync(this.cookiesFilePath)) {
                const cookiesData = fs.readFileSync(this.cookiesFilePath, 'utf8');
                return JSON.parse(cookiesData);
            }
            return [];
        } catch (error) {
            console.error(`❌ Error loading cookies: ${error.message}`);
            return [];
        }
    }

    // Save cookies to file
    saveCookies(cookies) {
        try {
            const cookiesJson = JSON.stringify(cookies, null, 2);
            fs.writeFileSync(this.cookiesFilePath, cookiesJson);
            console.log(`✅ Saved ${cookies.length} cookies to ${this.cookiesFilePath}`);
        } catch (error) {
            console.error(`❌ Error saving cookies: ${error.message}`);
        }
    }

    // Extract cookies from a Puppeteer page
    async extractCookiesFromPage(page) {
        try {
            const cookies = await page.cookies();
            this.saveCookies(cookies);
            console.log(`🍪 Extracted ${cookies.length} cookies from current page`);
            return cookies;
        } catch (error) {
            console.error(`❌ Error extracting cookies: ${error.message}`);
            return [];
        }
    }

    // Apply cookies to a Puppeteer page
    async applyCookiesToPage(page) {
        try {
            const cookies = this.loadCookies();
            if (cookies.length > 0) {
                await page.setCookie(...cookies);
                console.log(`🍪 Applied ${cookies.length} cookies to page`);
            }
            return cookies.length;
        } catch (error) {
            console.error(`❌ Error applying cookies: ${error.message}`);
            return 0;
        }
    }

    // Create a cookie object
    createCookie(name, value, domain, options = {}) {
        return {
            name,
            value,
            domain,
            path: options.path || '/',
            expires: options.expires || Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days default
            httpOnly: options.httpOnly || false,
            secure: options.secure || false,
            sameSite: options.sameSite || 'Lax'
        };
    }

    // Add a single cookie
    addCookie(name, value, domain, options = {}) {
        const cookies = this.loadCookies();
        const newCookie = this.createCookie(name, value, domain, options);
        
        // Remove existing cookie with same name and domain
        const filteredCookies = cookies.filter(cookie => 
            !(cookie.name === name && cookie.domain === domain)
        );
        
        filteredCookies.push(newCookie);
        this.saveCookies(filteredCookies);
        console.log(`✅ Added cookie: ${name} for domain: ${domain}`);
    }

    // Remove cookies by domain
    removeCookiesByDomain(domain) {
        const cookies = this.loadCookies();
        const filteredCookies = cookies.filter(cookie => cookie.domain !== domain);
        this.saveCookies(filteredCookies);
        console.log(`🗑️ Removed cookies for domain: ${domain}`);
    }

    // Clear all cookies
    clearAllCookies() {
        this.saveCookies([]);
        console.log(`🧹 Cleared all cookies`);
    }

    // List all cookies
    listCookies() {
        const cookies = this.loadCookies();
        console.log(`\n🍪 COOKIES LIST (${cookies.length} total):`);
        cookies.forEach((cookie, index) => {
            console.log(`${index + 1}. ${cookie.name} = ${cookie.value.substring(0, 20)}... (${cookie.domain})`);
        });
        return cookies;
    }
}

module.exports = CookiesHelper;

// Example usage:
if (require.main === module) {
    const cookiesHelper = new CookiesHelper();
    
    // Example: Add authentication cookies for streaming sites
    console.log('🍪 Cookies Helper - Example Usage:');
    
    // Add example cookies
    cookiesHelper.addCookie('session_id', 'abc123def456', '.streaming-site.com', {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    });
    
    cookiesHelper.addCookie('auth_token', 'xyz789token', '.video-platform.com', {
        httpOnly: false,
        secure: true,
        expires: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    });
    
    // List all cookies
    cookiesHelper.listCookies();
}
