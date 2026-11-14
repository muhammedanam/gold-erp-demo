import { execSync } from 'node:child_process';

console.log('⚡ Building Vite in client directory...');
execSync('npx vite build', { stdio: 'inherit' });
console.log('✅ Client Vite build complete!');
