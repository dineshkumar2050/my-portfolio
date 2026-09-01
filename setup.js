/**
 * setup.js — run once after `npm install`
 * Copies learning-content HTML files into public/learning-content/
 * so they are served by Next.js at /learning-content/*.html
 */
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../learning-content');
const dest = path.resolve(__dirname, 'public/learning-content');

if (!fs.existsSync(src)) {
  console.warn(`[setup] learning-content folder not found at ${src}`);
  console.warn('[setup] Skipping learning content copy. Learnings section will still work but files wont load in modals.');
  process.exit(0);
}

fs.mkdirSync(dest, { recursive: true });

const files = fs.readdirSync(src).filter(f => f.endsWith('.html'));
let copied = 0;
files.forEach(file => {
  fs.copyFileSync(path.join(src, file), path.join(dest, file));
  copied++;
});

console.log(`[setup] ✅ Copied ${copied} learning content files to public/learning-content/`);
