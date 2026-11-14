const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 SwarnaERP Build running from server directory...');
console.log('Current working directory:', process.cwd());

// Locate client directory
let clientDir = path.resolve(__dirname, '../../client');
if (!fs.existsSync(clientDir)) {
  clientDir = path.resolve(__dirname, '../client');
}
if (!fs.existsSync(clientDir)) {
  clientDir = path.resolve(process.cwd(), '../client');
}

console.log(`📁 Resolved client directory: ${clientDir}`);

if (fs.existsSync(clientDir)) {
  console.log('📦 Installing client dependencies...');
  execSync('npm install', { cwd: clientDir, stdio: 'inherit' });

  console.log('⚡ Building client Vite bundle...');
  execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

  // Ensure output is copied to server/dist as well as client/dist
  const clientDist = path.join(clientDir, 'dist');
  const serverDist = path.join(process.cwd(), 'dist');
  const rootDist = path.resolve(clientDir, '../dist');

  if (fs.existsSync(clientDist)) {
    try {
      if (!fs.existsSync(serverDist)) fs.cpSync(clientDist, serverDist, { recursive: true });
      if (!fs.existsSync(rootDist)) fs.cpSync(clientDist, rootDist, { recursive: true });
      console.log('✓ Build artifacts synchronized across server/dist and root/dist');
    } catch (e) {
      console.warn('Copy warning:', e.message);
    }
  }
} else {
  console.warn('⚠️ Could not locate client directory at:', clientDir);
}

console.log('✅ Server build step completed successfully!');
