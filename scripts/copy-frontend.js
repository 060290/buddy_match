const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../frontend/dist');
const dest = path.join(__dirname, '../backend/public');

if (!fs.existsSync(src)) {
  console.error('Frontend build not found at', src);
  process.exit(1);
}

if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true });
fs.mkdirSync(dest, { recursive: true });

function copyDir(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(src, dest);
console.log('Copied frontend/dist to backend/public');
