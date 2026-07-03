import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'dist');
const destDir = path.join(__dirname, 'extension');

// Helper to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('Copying build assets to extension folder...');
  
  // Copy assets folder if it exists
  const assetsSrc = path.join(srcDir, 'assets');
  const assetsDest = path.join(destDir, 'assets');
  if (fs.existsSync(assetsSrc)) {
    if (fs.existsSync(assetsDest)) {
      fs.rmSync(assetsDest, { recursive: true, force: true });
    }
    copyDir(assetsSrc, assetsDest);
    console.log('✓ Copied assets directory.');
  }

  // Copy index.html to sidepanel.html, popup.html, options.html
  const indexHtmlPath = path.join(srcDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    fs.copyFileSync(indexHtmlPath, path.join(destDir, 'sidepanel.html'));
    fs.copyFileSync(indexHtmlPath, path.join(destDir, 'popup.html'));
    fs.copyFileSync(indexHtmlPath, path.join(destDir, 'options.html'));
    console.log('✓ Created sidepanel.html, popup.html, options.html in extension folder.');
  }

  console.log('Extension built successfully!');
} catch (err) {
  console.error('Error copying assets to extension folder:', err);
  process.exit(1);
}
