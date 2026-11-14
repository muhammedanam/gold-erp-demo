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

      // Create Node entry points in dist so Vercel can run fullstack Express + Static
      const serverEntrySource = `const express = require('express');
const path = require('path');
const cors = require('cors');
let apiRoutes;
try {
  apiRoutes = require('../src/routes/api');
} catch (e) {
  try {
    apiRoutes = require('../../server/src/routes/api');
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

// Serve frontend static files
app.use(express.static(__dirname));

// SPA fallback to index.html
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

      fs.writeFileSync(path.join(serverDist, 'index.js'), serverEntrySource);
      fs.writeFileSync(path.join(serverDist, 'app.js'), serverEntrySource);
      fs.writeFileSync(path.join(serverDist, 'server.js'), serverEntrySource);

      if (fs.existsSync(rootDist)) {
        fs.writeFileSync(path.join(rootDist, 'index.js'), serverEntrySource);
        fs.writeFileSync(path.join(rootDist, 'app.js'), serverEntrySource);
        fs.writeFileSync(path.join(rootDist, 'server.js'), serverEntrySource);
      }

      console.log('✓ Created Node entry points (index.js, app.js, server.js) in dist');
    } catch (e) {
      console.warn('Copy/write warning:', e.message);
    }
  }
} else {
  console.warn('⚠️ Could not locate client directory at:', clientDir);
}

console.log('✅ Server build step completed successfully!');
