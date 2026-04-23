const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const srcDir = path.join(__dirname, '..', 'images', 'Ecological Design project photos and writeups', 'House Dyer- George');
const outDir = path.join(__dirname, '..', 'images', 'webp', 'ecological-design', 'house-dyer-george');

const sizes = [
  { suffix: '480', width: 480 },
  { suffix: '800', width: 800 },
  { suffix: '1200', width: 1200 },
];

const conversions = [
  { input: 'house dyer (1).jpg', baseName: 'house-dyer-george-1' },
  { input: 'house dyer (2).jpg', baseName: 'house-dyer-george-2-new' },
];

async function convert() {
  for (const { input, baseName } of conversions) {
    const inputPath = path.join(srcDir, input);
    if (!fs.existsSync(inputPath)) {
      console.warn(`Skipping (not found): ${inputPath}`);
      continue;
    }
    for (const { suffix, width } of sizes) {
      const outFile = path.join(outDir, `${baseName}-${suffix}.webp`);
      await sharp(inputPath)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outFile);
      console.log(`Written: ${outFile}`);
    }
  }
  console.log('Done.');
}

convert().catch(err => { console.error(err); process.exit(1); });
