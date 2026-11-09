/**
 * Zentime - Chrome Web Store Packaging Script
 * Generates a clean, production-ready zip bundle in dist/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const BUILD_TEMP_DIR = path.join(DIST_DIR, 'zentime-build');

// Files and folders strictly required for the Chrome Web Store extension package
const REQUIRED_FILES = [
  'manifest.json',
  'background.js',
  'popup.html',
  'popup.css',
  'popup.js',
  'blocked.html',
  'blocked.css',
  'blocked.js',
  'audio.html',
  'audio.js'
];

const REQUIRED_DIRS = [
  'icons',
  'fonts'
];

console.log('🌸 Zentime Packaging Tool');
console.log('----------------------------------------');

// 1. Read & Validate manifest.json
const manifestPath = path.join(ROOT_DIR, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Error: manifest.json not found!');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (err) {
  console.error('❌ Error: Failed to parse manifest.json:', err.message);
  process.exit(1);
}

const version = manifest.version || '1.0.0';
const packageName = `zentime-v${version}.zip`;
const outputZipPath = path.join(DIST_DIR, packageName);

console.log(`📦 Extension Name: ${manifest.name}`);
console.log(`🏷️  Version:        ${version}`);
console.log(`🎯 Target Zip:     dist/${packageName}`);

// 2. Syntax Check JavaScript files
console.log('\n🔎 Validating JavaScript syntax...');
const jsFiles = ['background.js', 'popup.js', 'blocked.js', 'audio.js'];
for (const jsFile of jsFiles) {
  const filePath = path.join(ROOT_DIR, jsFile);
  try {
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    console.log(`  ✓ ${jsFile} syntax valid`);
  } catch (err) {
    console.error(`❌ Syntax error in ${jsFile}:`, err.message);
    process.exit(1);
  }
}

// 3. Prepare Clean Temp Directory
if (fs.existsSync(BUILD_TEMP_DIR)) {
  fs.rmSync(BUILD_TEMP_DIR, { recursive: true, force: true });
}
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}
fs.mkdirSync(BUILD_TEMP_DIR, { recursive: true });

// Helper to copy files recursively
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('\n📋 Staging files...');
let stagedCount = 0;

for (const file of REQUIRED_FILES) {
  const src = path.join(ROOT_DIR, file);
  const dest = path.join(BUILD_TEMP_DIR, file);
  if (!fs.existsSync(src)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  fs.copyFileSync(src, dest);
  console.log(`  + ${file}`);
  stagedCount++;
}

for (const dir of REQUIRED_DIRS) {
  const src = path.join(ROOT_DIR, dir);
  const dest = path.join(BUILD_TEMP_DIR, dir);
  if (!fs.existsSync(src)) {
    console.error(`❌ Missing required directory: ${dir}`);
    process.exit(1);
  }
  copyRecursive(src, dest);
  const filesInside = fs.readdirSync(src);
  console.log(`  + ${dir}/ (${filesInside.length} files)`);
  stagedCount += filesInside.length;
}

// 4. Create ZIP Archive
console.log('\n🗜️  Compressing into distribution zip...');
if (fs.existsSync(outputZipPath)) {
  fs.unlinkSync(outputZipPath);
}

try {
  // Use PowerShell Compress-Archive
  const psCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${BUILD_TEMP_DIR}\\*' -DestinationPath '${outputZipPath}' -CompressionLevel Optimal -Force"`;
  execSync(psCommand, { stdio: 'pipe' });
} catch (err) {
  console.error('❌ Compression failed:', err.message);
  process.exit(1);
}

// 5. Cleanup Temp Directory
fs.rmSync(BUILD_TEMP_DIR, { recursive: true, force: true });

// 6. Verify Zip and Compute Checksum
if (!fs.existsSync(outputZipPath)) {
  console.error('❌ Error: Zip archive was not generated!');
  process.exit(1);
}

const zipStats = fs.statSync(outputZipPath);
const zipBuffer = fs.readFileSync(outputZipPath);
const sha256 = crypto.createHash('sha256').update(zipBuffer).digest('hex');
const sizeKb = (zipStats.size / 1024).toFixed(2);

console.log('\n✨ Packaging Complete!');
console.log('========================================');
console.log(`📁 File:        ${outputZipPath}`);
console.log(`📊 Size:        ${sizeKb} KB (${zipStats.size.toLocaleString()} bytes)`);
console.log(`🔢 Total Files: ${stagedCount} files`);
console.log(`🔒 SHA256:      ${sha256}`);
console.log('========================================');
console.log('🚀 Ready to upload to Chrome Developer Dashboard:');
console.log('   https://chrome.google.com/webstore/devconsole\n');
