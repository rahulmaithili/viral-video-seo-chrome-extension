import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const userMedia = {
  16: 'C:/Users/Rahul Chandrabanshi/.gemini/antigravity/brain/4a29aac9-e375-4f24-944a-df2e06becb98/.user_uploaded/media_1789412807723.png',
  32: 'C:/Users/Rahul Chandrabanshi/.gemini/antigravity/brain/4a29aac9-e375-4f24-944a-df2e06becb98/.user_uploaded/media_1789412807762.png',
  48: 'C:/Users/Rahul Chandrabanshi/.gemini/antigravity/brain/4a29aac9-e375-4f24-944a-df2e06becb98/.user_uploaded/media_1789412807764.png',
  128: 'C:/Users/Rahul Chandrabanshi/.gemini/antigravity/brain/4a29aac9-e375-4f24-944a-df2e06becb98/.user_uploaded/media_1789412807787.png',
};

const packDirs = [
  'logo-asset-pack/website',
  'logo-asset-pack/favicon',
  'logo-asset-pack/chrome-extension',
  'logo-asset-pack/mobile-app',
  'logo-asset-pack/master',
  'public/icons',
];

packDirs.forEach((d) => fs.mkdirSync(path.resolve(d), { recursive: true }));

// 1. Chrome Extension icons: 16, 32, 48, 128
fs.copyFileSync(userMedia[16], path.resolve('logo-asset-pack/chrome-extension/icon16.png'));
fs.copyFileSync(userMedia[32], path.resolve('logo-asset-pack/chrome-extension/icon32.png'));
fs.copyFileSync(userMedia[48], path.resolve('logo-asset-pack/chrome-extension/icon48.png'));
fs.copyFileSync(userMedia[128], path.resolve('logo-asset-pack/chrome-extension/icon128.png'));

// Also copy to public/icons for the Chrome extension dist
fs.copyFileSync(userMedia[16], path.resolve('public/icons/icon-16.png'));
fs.copyFileSync(userMedia[32], path.resolve('public/icons/icon-32.png'));
fs.copyFileSync(userMedia[48], path.resolve('public/icons/icon-48.png'));
fs.copyFileSync(userMedia[128], path.resolve('public/icons/icon-128.png'));

// 2. Favicons: 16, 32, 48, 64
fs.copyFileSync(userMedia[16], path.resolve('logo-asset-pack/favicon/favicon-16.png'));
fs.copyFileSync(userMedia[32], path.resolve('logo-asset-pack/favicon/favicon-32.png'));
fs.copyFileSync(userMedia[48], path.resolve('logo-asset-pack/favicon/favicon-48.png'));
fs.copyFileSync(userMedia[128], path.resolve('logo-asset-pack/favicon/favicon-64.png')); // crisp high-density
fs.copyFileSync(userMedia[32], path.resolve('public/favicon.png'));

// 3. Mobile app icons
fs.copyFileSync(userMedia[128], path.resolve('logo-asset-pack/mobile-app/app-icon-128.png'));
fs.copyFileSync(userMedia[128], path.resolve('logo-asset-pack/mobile-app/app-icon-192.png'));
fs.copyFileSync(userMedia[128], path.resolve('logo-asset-pack/mobile-app/app-icon-512.png'));
fs.copyFileSync(userMedia[128], path.resolve('logo-asset-pack/mobile-app/app-icon-1024.png'));
fs.copyFileSync(userMedia[128], path.resolve('logo-asset-pack/master/rs-monogram-1024.png'));

// 4. Create Master Vector SVG of the exact Rahul Scripts RS Monogram
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Deep Navy background with neon glow -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050B14" />
      <stop offset="50%" stop-color="#0A1128" />
      <stop offset="100%" stop-color="#02060D" />
    </linearGradient>

    <!-- Electric Blue Gradient -->
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D2FF" />
      <stop offset="40%" stop-color="#0080FF" />
      <stop offset="100%" stop-color="#0055FF" />
    </linearGradient>

    <!-- Silver/White Gradient for R -->
    <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>

    <!-- Neon Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Squircle Rounded Container with Border Glow -->
  <rect x="24" y="24" width="464" height="464" rx="96" fill="url(#bgGrad)" stroke="#0080FF" stroke-width="8" filter="url(#glow)" />
  <rect x="24" y="24" width="464" height="464" rx="96" fill="url(#bgGrad)" stroke="#00D2FF" stroke-width="3" />

  <!-- R Letterform (Clean White/Silver Cut) -->
  <path d="M120 140 H230 C275 140 305 165 305 205 C305 238 280 262 245 268 L320 372 H245 L180 280 H170 V372 H120 Z M170 190 V235 H225 C245 235 255 224 255 212 C255 200 245 190 225 190 Z" fill="url(#whiteGrad)" />

  <!-- Coding Prompt Brackets '</>' inside the R leg cut -->
  <g transform="translate(155, 305) scale(0.7)" fill="#00D2FF" filter="url(#glow)">
    <path d="M30 10 L10 30 L30 50 L35 44 L21 30 L35 16 Z" />
    <path d="M45 55 L58 5 L64 7 L51 57 Z" />
    <path d="M74 10 L94 30 L74 50 L69 44 L83 30 L69 16 Z" />
  </g>

  <!-- S Letterform (Futuristic Electric Blue) -->
  <path d="M280 140 H380 V195 H310 C295 195 285 205 285 218 C285 232 298 242 320 248 L350 256 C385 266 410 290 410 326 C410 368 375 392 320 392 H220 V335 H315 C335 335 345 325 345 315 C345 302 332 292 310 286 L280 278 C245 268 225 245 225 210 C225 168 255 140 280 140 Z" fill="url(#blueGrad)" filter="url(#glow)" />
</svg>`;

fs.writeFileSync(path.resolve('logo-asset-pack/master/rs-monogram.svg'), svgContent);
fs.writeFileSync(path.resolve('public/icons/rs-monogram.svg'), svgContent);

// 5. Website Dark Header Wordmark (SVG and preview)
const headerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120" width="600" height="120">
  <defs>
    <linearGradient id="hBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D2FF" />
      <stop offset="100%" stop-color="#0055FF" />
    </linearGradient>
    <linearGradient id="hWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="#070D18" rx="16" />

  <!-- Logo Mark -->
  <g transform="translate(20, 16) scale(0.17)">
    ${svgContent.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
  </g>

  <!-- Wordmark Text -->
  <text x="130" y="58" font-family="'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="34" fill="url(#hWhiteGrad)" letter-spacing="0.5">RAHUL SCRIPTS</text>
  <text x="130" y="88" font-family="'Inter', 'Segoe UI', sans-serif" font-weight="700" font-size="14" fill="url(#hBlueGrad)" letter-spacing="3.5">VIRAL VIDEO AI STUDIO</text>
</svg>`;

fs.writeFileSync(path.resolve('logo-asset-pack/website/rahul-scripts-header.svg'), headerSvg);
fs.copyFileSync(userMedia[128], path.resolve('logo-asset-pack/website/rahul-scripts-header.png'));
fs.copyFileSync(userMedia[128], path.resolve('logo-asset-pack/master/rahul-scripts-wordmark.png'));

console.log('✓ Rahul Scripts Logo Asset Pack successfully created in logo-asset-pack/');
