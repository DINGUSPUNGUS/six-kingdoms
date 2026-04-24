const fs = require('fs');
const path = require('path');

const ecoDesignDir = path.join(__dirname, '..', 'images', 'webp', 'ecological-design');
const landMgmtDir  = path.join(__dirname, '..', 'images', 'webp', 'land-management');

// Mapping: filename prefix -> subfolder name (ecological-design)
const ecoDesignMap = [
  { prefix: 'house-mcharry-rheenedal',           folder: 'house-mcharry-rheenedal' },
  { prefix: 'house-dyer-george',                 folder: 'house-dyer-george' },
  { prefix: 'terra-verta-habitats',              folder: 'terra-verta-habitats' },
  { prefix: 'diepklowe-orchard',                 folder: 'diepklowe-orchard' },
  { prefix: 'wilderness-biodiversity-corridor',  folder: 'wilderness-biodiversity-corridor' },
  { prefix: 'garden-design',                     folder: 'garden-design' },
];

// Mapping: filename prefix -> subfolder name (land-management)
const landMgmtMap = [
  { prefix: 'alien clearing',                    folder: 'alien-clearing' },
  { prefix: 'alien%20clearing',                  folder: 'alien-clearing' },
  { prefix: 'diepklowe-regenerative-farm',       folder: 'diepklowe-farm' },
  { prefix: 'greenpops-forests-for-life-program',folder: 'greenpops' },
  { prefix: 'salt-river-invasive-plant-clearing',folder: 'salt-river' },
];

function moveFiles(baseDir, mappings) {
  const files = fs.readdirSync(baseDir);
  for (const file of files) {
    const fullPath = path.join(baseDir, file);
    if (fs.statSync(fullPath).isDirectory()) continue; // skip existing subdirs

    let matched = false;
    for (const { prefix, folder } of mappings) {
      if (file.toLowerCase().startsWith(prefix.toLowerCase())) {
        const destDir = path.join(baseDir, folder);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        const destPath = path.join(destDir, file);
        fs.renameSync(fullPath, destPath);
        console.log(`Moved: ${file} -> ${folder}/${file}`);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Move to misc/
      const miscDir = path.join(baseDir, 'misc');
      if (!fs.existsSync(miscDir)) fs.mkdirSync(miscDir, { recursive: true });
      fs.renameSync(fullPath, path.join(miscDir, file));
      console.log(`Misc:  ${file} -> misc/${file}`);
    }
  }
}

console.log('--- ecological-design ---');
moveFiles(ecoDesignDir, ecoDesignMap);
console.log('\n--- land-management ---');
moveFiles(landMgmtDir, landMgmtMap);
console.log('\nDone.');
