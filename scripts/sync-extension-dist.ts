import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const targetDir = path.resolve(process.cwd(), 'public/extension-build');
const targetAssetsDir = path.join(targetDir, 'assets');

if (fs.existsSync(targetAssetsDir)) {
  fs.rmSync(targetAssetsDir, { recursive: true, force: true });
}
fs.mkdirSync(targetAssetsDir, { recursive: true });

// 1. Copy index.html as options.html
const indexHtmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let content = fs.readFileSync(indexHtmlPath, 'utf-8');
  // ensure relative asset paths
  content = content.replace(/(src|href)="\/assets\//g, '$1="./assets/');
  fs.writeFileSync(path.join(targetDir, 'options.html'), content, 'utf-8');
  console.log('[sync-extension-dist] Synced options.html');
}

// 2. Copy all dist/assets to public/extension-build/assets
const distAssetsDir = path.join(distDir, 'assets');
const assetFiles: string[] = [];
if (fs.existsSync(distAssetsDir)) {
  const files = fs.readdirSync(distAssetsDir);
  for (const f of files) {
    const srcPath = path.join(distAssetsDir, f);
    const destPath = path.join(targetAssetsDir, f);
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
      assetFiles.push(f);
      console.log('[sync-extension-dist] Synced asset:', f);
    }
  }
}

// 3. Write manifest.json index for runtime fetch
fs.writeFileSync(
  path.join(targetDir, 'assets-manifest.json'),
  JSON.stringify({ optionsHtml: 'options.html', assets: assetFiles }, null, 2),
  'utf-8'
);
console.log('[sync-extension-dist] Done syncing extension-build!');
