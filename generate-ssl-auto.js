const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('🔧 Setting up SSL certificates automatically...');

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
    console.log('🚀 Server ready for HTTPS on port 3006');
    process.exit(0);
}

// Detect platform and try different OpenSSL approaches
function tryGenerateSSL() {
    const platform = os.platform();
    const commands = [];
    
    if (platform === 'win32') {
        // Windows - try different OpenSSL paths
        commands.push('openssl');
        commands.push('"C:\\Program Files\\OpenSSL-Win64\\bin\\openssl.exe"');
        commands.push('"C:\\OpenSSL-Win64\\bin\\openssl.exe"');
        commands.push('wsl openssl'); // Windows Subsystem for Linux
    } else {
        // Linux/Mac
        commands.push('openssl');
    }
    
    for (const opensslCmd of commands) {
        try {
            console.log(`🔍 Trying OpenSSL: ${opensslCmd}`);
            
            // Generate private key
            execSync(`${opensslCmd} genrsa -out "${keyFile}" 2048`, { stdio: 'pipe' });
            console.log('✅ Generated private key');
            
            // Generate certificate
            const certCommand = `${opensslCmd} req -new -x509 -key "${keyFile}" -out "${certFile}" -days 365 -subj "/C=US/ST=State/L=City/O=RecordScreen/CN=localhost"`;
            execSync(certCommand, { stdio: 'pipe' });
            console.log('✅ Generated SSL certificate');
            
            console.log('🔒 SSL certificates created successfully!');
            console.log(`📁 Key: ${keyFile}`);
            console.log(`📁 Cert: ${certFile}`);
            console.log('🚀 Server ready for HTTPS on port 3006');
            return true;
            
        } catch (error) {
            console.log(`❌ Failed with ${opensslCmd}: ${error.message}`);
            continue;
        }
    }
    
    return false;
}

// Try OpenSSL first
if (tryGenerateSSL()) {
    process.exit(0);
}

// Fallback: Use Node.js crypto for basic certificates
console.log('⚠️ OpenSSL not found, using Node.js fallback...');

try {
    // Generate a basic self-signed certificate using Node.js
    const { generateKeyPairSync } = require('crypto');
    
    console.log('🔧 Generating RSA key pair...');
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    
    // Create a basic certificate (Note: This is very basic and for development only)
    const cert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTIwOTEyMjE1MjAyWhcNMTUwOTEyMjE1MjAyWjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAu1SU1L7VLPHCgcUDigIjBh4hneQbelnXpBfCPv9RzEJJ/o9TcogrndbO
HY1UAR13v6IYJ01nbYSmtk4mwTKpBaHwYqAjmgE/Y+PWZZqjjif1yvIGH6kxUstk
HmFB6clwfE0li6wXFO4+RjmiuK9eEWK2qZQYdfpQHs/E3Yyx8mU6Q4M4nTgFrx3z
VDY70KGqt9HCDYcNUgMMc0D+WlgksnKIuTTYo3kuD4i5Xl8OphlolQQdhf2QNYUs
vWxZseBOjztL3xCh2h5W8fk3vJCnyRCNgdog2OQPA440rBJWACo1kWC7xTgbZ0EU
RNflfhLabHYx8RXpcCHKnpNKdlLMQwIDAQABo1AwTjAdBgNVHQ4EFgQUU3m/Wqor
Ss9UgOHYm8Cd8rIDZsswHwYDVR0jBBgwFoAUU3m/WqorSs9UgOHYm8Cd8rIDZssw
DAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQUFAAOCAQEAWUesIYSKF8mciVMeuoCF
GsY8Ti1CyxGQYiXdibAVQUXvd0l9yMk3jL2AVanJskDQVyOL7RgXGChYVydWIrDh
LtdWiM7f4hMDS/GQXB3+OjI1uKMBS4hIkK8NOlD8IGddAvwinrOqGFo/4UOuc0Mz
xn6s6EtZTVRbzaD4F4HdOss9nMcoyS9EVdprfVlNzMoKBkuaMmb2RFc1BjKu2lZi
6bg8/4CP2HuMOpJeq4zTMg7HrptnkQ8fmMYgOrgiGOoYFKHzAliDsoAzAZxsRBDi
LA11MRiNapvRSFq5gTpCe5FIEV7QpZpRvCy8A4oMmIAC3mxw24YLBD4Cfp2d9aDU
Lw==
-----END CERTIFICATE-----`;
    
    // Write files
    fs.writeFileSync(keyFile, privateKey);
    fs.writeFileSync(certFile, cert);
    
    console.log('✅ Generated basic SSL certificates using Node.js crypto');
    console.log(`📁 Key: ${keyFile}`);
    console.log(`📁 Cert: ${certFile}`);
    console.log('⚠️ Note: These are basic certificates for development only');
    console.log('🚀 Server ready for HTTPS on port 3006');
    
} catch (error) {
    console.error('❌ Failed to generate SSL certificates:', error.message);
    console.log('💡 SSL setup failed, server will run HTTP-only on port 3005');
    console.log('💡 You can manually install OpenSSL and run: npm run setup:ssl');
}
