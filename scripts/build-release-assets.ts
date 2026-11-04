import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
// @ts-expect-error crx3 does not have bundled type definitions
import crx3 from 'crx3';
import { DEFAULT_PROFILES } from '../src/utils/defaultData';
import { buildExtensionZipObject } from '../src/utils/extensionGenerator';
import { compileCuratedGfwlistPac } from '../src/utils/gfwlistPacCompiler';

async function buildRelease() {
  console.log('📦 Building ProxyPilot v1.0.6 Release Assets (.zip, .crx, .pac)...');

  // Build the complete, tested MV3 extension ZIP using the single source of truth
  const zip = await buildExtensionZipObject(DEFAULT_PROFILES, 'auto_switch');

  // Also include the standalone curated GFWList pure ASCII PAC file in root of zip
  const curatedPac = compileCuratedGfwlistPac('SOCKS5 127.0.0.1:7897; SOCKS 127.0.0.1:7897; DIRECT');
  zip.file("proxy.pac", curatedPac);

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  // Ensure output dirs exist
  const distReleaseDir = path.resolve(process.cwd(), 'dist-release');
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(distReleaseDir)) fs.mkdirSync(distReleaseDir, { recursive: true });
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const zipName = 'ProxyPilot-v1.0.6-chrome-extension.zip';
  fs.writeFileSync(path.join(distReleaseDir, zipName), zipBuffer);
  fs.writeFileSync(path.join(publicDir, zipName), zipBuffer);
  fs.writeFileSync(path.join(distReleaseDir, 'proxy.pac'), curatedPac);
  fs.writeFileSync(path.join(publicDir, 'proxy.pac'), curatedPac);

  // Generate official CRX3 format extension package
  const crxName = 'ProxyPilot-v1.0.6.crx';
  const keyPath = path.join(distReleaseDir, 'ProxyPilot.pem');
  const crxDest = path.join(distReleaseDir, crxName);
  const publicCrxDest = path.join(publicDir, crxName);

  await crx3(Readable.from(zipBuffer), {
    crxPath: crxDest,
    keyPath: keyPath
  });

  if (fs.existsSync(crxDest)) {
    fs.copyFileSync(crxDest, publicCrxDest);
  }

  console.log(`✅ Successfully generated:`);
  console.log(`   - dist-release/${zipName} (${(zipBuffer.length / 1024).toFixed(1)} KB)`);
  console.log(`   - dist-release/${crxName} (${(fs.statSync(crxDest).size / 1024).toFixed(1)} KB)`);
  console.log(`   - dist-release/proxy.pac (${(curatedPac.length / 1024).toFixed(1)} KB)`);
}

buildRelease().catch(err => {
  console.error('Failed to build release:', err);
  process.exit(1);
});
