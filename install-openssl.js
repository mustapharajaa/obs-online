const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');

console.log('🔧 Installing OpenSSL automatically...');

const platform = os.platform();

function checkOpenSSL() {
    try {
        execSync('openssl version', { stdio: 'pipe' });
        console.log('✅ OpenSSL already installed');
        return true;
    } catch (error) {
        return false;
    }
}

function installOpenSSLWindows() {
    console.log('🪟 Installing OpenSSL on Windows...');
    
    const methods = [
        // Method 1: winget (Windows Package Manager)
        () => {
            console.log('🔍 Trying winget...');
            execSync('winget install --id=ShiningLight.OpenSSL --silent', { stdio: 'inherit' });
        },
        
        // Method 2: Chocolatey
        () => {
            console.log('🔍 Trying Chocolatey...');
            execSync('choco install openssl -y', { stdio: 'inherit' });
        },
        
        // Method 3: Scoop
        () => {
            console.log('🔍 Trying Scoop...');
            execSync('scoop install openssl', { stdio: 'inherit' });
        }
    ];
    
    for (const method of methods) {
        try {
            method();
            if (checkOpenSSL()) {
                console.log('✅ OpenSSL installed successfully');
                return true;
            }
        } catch (error) {
            console.log(`❌ Method failed: ${error.message}`);
            continue;
        }
    }
    
    return false;
}

function installOpenSSLLinux() {
    console.log('🐧 Installing OpenSSL on Linux...');
    
    const commands = [
        'apt-get update && apt-get install -y openssl',
        'yum install -y openssl',
        'dnf install -y openssl',
        'pacman -S openssl'
    ];
    
    for (const cmd of commands) {
        try {
            console.log(`🔍 Trying: ${cmd}`);
            execSync(cmd, { stdio: 'inherit' });
            if (checkOpenSSL()) {
                console.log('✅ OpenSSL installed successfully');
                return true;
            }
        } catch (error) {
            continue;
        }
    }
    
    return false;
}

function installOpenSSLMac() {
    console.log('🍎 Installing OpenSSL on macOS...');
    
    try {
        execSync('brew install openssl', { stdio: 'inherit' });
        if (checkOpenSSL()) {
            console.log('✅ OpenSSL installed successfully');
            return true;
        }
    } catch (error) {
        console.log('❌ Homebrew installation failed');
    }
    
    return false;
}

// Main installation logic
if (checkOpenSSL()) {
    process.exit(0);
}

let success = false;

switch (platform) {
    case 'win32':
        success = installOpenSSLWindows();
        break;
    case 'linux':
        success = installOpenSSLLinux();
        break;
    case 'darwin':
        success = installOpenSSLMac();
        break;
    default:
        console.log(`❌ Unsupported platform: ${platform}`);
}

if (success) {
    console.log('🔒 OpenSSL installation complete!');
    console.log('🚀 Ready to generate SSL certificates');
} else {
    console.log('❌ OpenSSL installation failed');
    console.log('💡 Manual installation required:');
    console.log('   Windows: https://slproweb.com/products/Win32OpenSSL.html');
    console.log('   Linux: sudo apt-get install openssl');
    console.log('   macOS: brew install openssl');
    console.log('⚠️ Server will run HTTP-only without OpenSSL');
}
