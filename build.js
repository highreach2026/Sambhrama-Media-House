const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const outputDir = path.join(rootDir, '.vercel', 'output');
const staticDir = path.join(outputDir, 'static');

console.log('Building for Vercel Build Output API v3...');

// 1. Clean output directory
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(staticDir, { recursive: true });

// Helper to copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 2. Copy static asset directories and files
const itemsToCopy = [
  '_nuxt',
  'img',
  'dark',
  'cdnjs.cloudflare.com',
  'index.html'
];

for (const item of itemsToCopy) {
  const src = path.join(rootDir, item);
  const dest = path.join(staticDir, item);
  if (fs.existsSync(src)) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      console.log(`Copying directory: ${item}...`);
      copyDirSync(src, dest);
    } else {
      console.log(`Copying file: ${item}...`);
      fs.copyFileSync(src, dest);
    }
  }
}

// 3. Also duplicate _nuxt as nuxt inside staticDir for extra fallback resilience
console.log('Copying _nuxt to nuxt alias in static output...');
copyDirSync(path.join(rootDir, '_nuxt'), path.join(staticDir, 'nuxt'));

// 4. Generate .vercel/output/config.json
const config = {
  version: 3,
  routes: [
    {
      src: '^/_nuxt/(.*)$',
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      continue: true
    },
    {
      src: '^/nuxt/(.*)$',
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      continue: true
    },
    {
      src: '^/img/(.*)$',
      headers: { 'cache-control': 'public, max-age=86400' },
      continue: true
    },
    {
      src: '^/(?:index(?:\\.html)?)?$',
      headers: { Location: '/dark/creative-agency.html' },
      status: 302
    },
    {
      src: '^/dark/?$',
      headers: { Location: '/dark/creative-agency.html' },
      status: 302
    },
    {
      src: '^/home/?$',
      headers: { Location: '/dark/creative-agency.html' },
      status: 302
    },
    {
      src: '^/creative-agency(?:\\.html)?$',
      headers: { Location: '/dark/creative-agency.html' },
      status: 302
    },
    {
      src: '^/contact(?:\\.html)?$',
      headers: { Location: '/dark/contact.html' },
      status: 302
    },
    {
      src: '^/dark/creative-agency/?$',
      dest: '/dark/creative-agency.html'
    },
    {
      src: '^/dark/contact/?$',
      dest: '/dark/contact.html'
    },
    {
      handle: 'filesystem'
    },
    {
      src: '^/_nuxt/(.*)$',
      dest: '/nuxt/$1'
    }
  ],
  overrides: {}
};

fs.writeFileSync(
  path.join(outputDir, 'config.json'),
  JSON.stringify(config, null, 2),
  'utf-8'
);

console.log('Vercel Build Output API v3 structure generated successfully!');
