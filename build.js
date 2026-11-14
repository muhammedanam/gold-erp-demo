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

  // Create entry points
  const entrySource = `const express = require('express');
const path = require('path');
const cors = require('cors');
let apiRoutes;
try {
  apiRoutes = require('./server/src/routes/api');
} catch (e) {
  try {
    apiRoutes = require('../server/src/routes/api');
  } catch (err) {
    console.warn('API routes fallback:', err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

if (apiRoutes) {
  app.use('/api', apiRoutes);
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'SwarnaERP Kerala Jewellery Cloud',
    timestamp: new Date().toISOString()
  });
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(\`SwarnaERP Cloud Server running on port \${PORT}\`);
  });
}

module.exports = app;
`;

  fs.writeFileSync(path.join(rootDist, 'index.js'), entrySource);
  fs.writeFileSync(path.join(rootDist, 'app.js'), entrySource);
  fs.writeFileSync(path.join(rootDist, 'server.js'), entrySource);
  fs.writeFileSync(path.join(clientDist, 'index.js'), entrySource);
  fs.writeFileSync(path.join(clientDist, 'app.js'), entrySource);
  fs.writeFileSync(path.join(clientDist, 'server.js'), entrySource);
}

console.log('✅ Build completed successfully with Node entrypoints!');
