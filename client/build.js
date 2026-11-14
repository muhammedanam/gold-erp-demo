const { execSync } = require('child_process');

console.log('⚡ Building Vite in client directory...');
execSync('npm run build', { stdio: 'inherit' });
console.log('✅ Client Vite build complete!');

