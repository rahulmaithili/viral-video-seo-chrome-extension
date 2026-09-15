import fs from 'fs';
import path from 'path';

const srcManifest = path.resolve('public', 'manifest.json');
const distManifest = path.resolve('dist', 'manifest.json');
const distDir = path.resolve('dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (fs.existsSync(srcManifest)) {
  fs.copyFileSync(srcManifest, distManifest);
  console.log('✓ Copied manifest.json to dist/');
} else {
  console.error('✗ Error: public/manifest.json not found');
  process.exit(1);
}
