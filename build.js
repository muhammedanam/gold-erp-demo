const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 SwarnaERP Vercel Build Starting...');
console.log('Current working directory:', process.cwd());

const inRoot = fs.existsSync(path.join(process.cwd(), 'client'));
const clientDir = inRoot ? path.join(process.cwd(), 'client') : process.cwd();

console.log(`📁 Client directory resolved to: ${clientDir}`);

// 1. Install client dependencies
console.log('📦 Installing client dependencies...');
execSync('npm install', { cwd: clientDir, stdio: 'inherit' });

// 2. Build Vite
console.log('⚡ Building Vite production bundle...');
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

// 3. Ensure dist is available at both ./dist and ./client/dist for Vercel
const clientDist = path.join(clientDir, 'dist');
const rootDist = path.join(process.cwd(), 'dist');

if (inRoot && fs.existsSync(clientDist)) {
  if (!fs.existsSync(rootDist)) {
    fs.cpSync(clientDist, rootDist, { recursive: true });
    console.log('✓ Copied build artifacts to root dist/');
  }
}

console.log('✅ Build completed successfully!');

