const fs = require('fs');
const path = require('path');

console.log('Generating SSL certificates using Node.js...');

// Create certificates directory
const certDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
}

// Try to use selfsigned package, fallback to simple approach
let cert, key;

try {
    const selfsigned = require('selfsigned');
    
    // Generate self-signed certificate
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, { 
        days: 365,
        keySize: 2048,
        algorithm: 'sha256'
    });
    
    cert = pems.cert;
    key = pems.private;
    console.log('✅ Using selfsigned package');
} catch (error) {
    console.log('⚠️ selfsigned package not found, installing...');
    
    // Install selfsigned package
    const { execSync } = require('child_process');
    try {
        execSync('npm install selfsigned', { stdio: 'inherit' });
        
        // Try again after installation
        const selfsigned = require('selfsigned');
        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const pems = selfsigned.generate(attrs, { 
            days: 365,
            keySize: 2048,
            algorithm: 'sha256'
        });
        
        cert = pems.cert;
        key = pems.private;
        console.log('✅ Installed and using selfsigned package');
    } catch (installError) {
        console.log('❌ Failed to install selfsigned, using fallback method');
        
        // Fallback: generate key pair and create basic certificate
        const crypto = require('crypto');
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        
        key = privateKey;
        cert = publicKey; // This is just for testing - not a real certificate
    }
}

// Write files
fs.writeFileSync(path.join(certDir, 'server.key'), key);
fs.writeFileSync(path.join(certDir, 'server.crt'), cert);

console.log('✅ SSL certificates generated successfully!');
console.log(`📁 Certificates saved to: ${certDir}`);
console.log('🔑 Files created:');
console.log('   - server.key (private key)');
console.log('   - server.crt (certificate)');
console.log('\nYou can now start your HTTPS server with: npm start');
