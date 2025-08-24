const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

// Ensure the certificates directory exists
const certsDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir);
}

const attrs = [{ name: 'commonName', value: 'localhost' }];
const altNames = [
  { type: 2, value: 'localhost' }, // DNS Name
  { type: 7, value: '127.0.0.1' },   // IP Address
  { type: 7, value: '80.240.21.187' } // IP Address
];

const options = {
  keySize: 2048,
  algorithm: 'sha256',
  days: 365,
  extensions: [{
    name: 'subjectAltName',
    altNames: altNames
  }]
};

console.log('🔄 Generating certificate for localhost, 127.0.0.1, and 80.240.21.187...');

const pems = selfsigned.generate(attrs, options);

const certPath = path.join(certsDir, 'server.crt');
const keyPath = path.join(certsDir, 'server.key');

fs.writeFileSync(certPath, pems.cert);
fs.writeFileSync(keyPath, pems.private);

console.log('✅ Certificate and private key generated successfully!');
console.log(`   - Certificate: ${certPath}`);
console.log(`   - Key: ${keyPath}`);
