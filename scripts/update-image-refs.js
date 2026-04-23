const fs = require('fs');
const path = require('path');

// Files to update
const files = [
  path.join(__dirname, '..', 'ecological-design.html'),
  path.join(__dirname, '..', 'land-management.html'),
  path.join(__dirname, '..', 'styles.css'),
  path.join(__dirname, '..', 'index.html'),
];

// Replacements: [from, to]
// Order matters - more specific prefixes first
const ecoReplacements = [
  ['images/webp/ecological-design/house-mcharry-rheenedal-', 'images/webp/ecological-design/house-mcharry-rheenedal/house-mcharry-rheenedal-'],
  ['images/webp/ecological-design/house-dyer-george-',       'images/webp/ecological-design/house-dyer-george/house-dyer-george-'],
  // The unsuffixed versions (house-dyer-george.webp, house-dyer-george-800.webp etc.)
  ["images/webp/ecological-design/house-dyer-george.",       'images/webp/ecological-design/house-dyer-george/house-dyer-george.'],
  ['images/webp/ecological-design/terra-verta-habitats-',    'images/webp/ecological-design/terra-verta-habitats/terra-verta-habitats-'],
  ['images/webp/ecological-design/terra-verta-habitats.',    'images/webp/ecological-design/terra-verta-habitats/terra-verta-habitats.'],
  ['images/webp/ecological-design/diepklowe-orchard-',       'images/webp/ecological-design/diepklowe-orchard/diepklowe-orchard-'],
  ['images/webp/ecological-design/wilderness-biodiversity-corridor-', 'images/webp/ecological-design/wilderness-biodiversity-corridor/wilderness-biodiversity-corridor-'],
  ['images/webp/ecological-design/wilderness-biodiversity-corridor.', 'images/webp/ecological-design/wilderness-biodiversity-corridor/wilderness-biodiversity-corridor.'],
  ['images/webp/ecological-design/garden-design-',           'images/webp/ecological-design/garden-design/garden-design-'],
];

const landReplacements = [
  ["images/webp/land-management/alien%20clearing-",          'images/webp/land-management/alien-clearing/alien%20clearing-'],
  ["images/webp/land-management/alien clearing-",            'images/webp/land-management/alien-clearing/alien clearing-'],
  ['images/webp/land-management/diepklowe-regenerative-farm-', 'images/webp/land-management/diepklowe-farm/diepklowe-regenerative-farm-'],
  ['images/webp/land-management/greenpops-forests-for-life-program-', 'images/webp/land-management/greenpops/greenpops-forests-for-life-program-'],
  ['images/webp/land-management/salt-river-invasive-plant-clearing-', 'images/webp/land-management/salt-river/salt-river-invasive-plant-clearing-'],
];

const allReplacements = [...ecoReplacements, ...landReplacements];

for (const filePath of files) {
  if (!fs.existsSync(filePath)) { console.warn(`Skipping (not found): ${filePath}`); continue; }
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [from, to] of allReplacements) {
    if (content.includes(from)) {
      const count = content.split(from).length - 1;
      content = content.split(from).join(to);
      console.log(`${path.basename(filePath)}: replaced "${from}" -> "${to}" (${count}x)`);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(filePath, content, 'utf8');
  else console.log(`${path.basename(filePath)}: no changes needed`);
}
console.log('\nDone.');
