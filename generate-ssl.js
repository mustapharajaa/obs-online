const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create SSL directory
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
    console.log('✅ Created ssl directory');
}

const keyFile = path.join(sslDir, 'server.key');
const certFile = path.join(sslDir, 'server.cert');

// Check if certificates already exist
if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
    console.log('✅ SSL certificates already exist');
    process.exit(0);
}

console.log('🔧 Generating self-signed SSL certificates...');

try {
    // Generate private key
    execSync(`openssl genrsa -out "${keyFile}" 2048`, { stdio: 'inherit' });
    console.log('✅ Generated private key');

    // Generate certificate
    const certCommand = `openssl req -new -x509 -key "${keyFile}" -out "${certFile}" -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=45.76.80.59"`;
    execSync(certCommand, { stdio: 'inherit' });
    console.log('✅ Generated SSL certificate');

    console.log('🔒 SSL certificates created successfully!');
    console.log(`📁 Key: ${keyFile}`);
    console.log(`📁 Cert: ${certFile}`);
    console.log('🚀 Restart your server to enable HTTPS on port 3006');

} catch (error) {
    console.error('❌ Error generating SSL certificates:', error.message);
    console.log('💡 Make sure OpenSSL is installed on your system');
    console.log('💡 Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
    console.log('💡 Linux: sudo apt-get install openssl');
    process.exit(1);
}
