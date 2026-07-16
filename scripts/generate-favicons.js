const sharp = require('sharp');
const path = require('path');

const src = path.join(__dirname, '..', 'images', 'branding', 'SK_Logo_Gradient_TransparentBG.webp');
const out = path.join(__dirname, '..');

const sizes = [
    { name: 'favicon-192.png', size: 192 },
    { name: 'favicon-32.png',  size: 32  },
    { name: 'favicon-16.png',  size: 16  },
    { name: 'apple-touch-icon.png', size: 180 },
];

(async () => {
    for (const { name, size } of sizes) {
        await sharp(src)
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png({ compressionLevel: 9 })
            .toFile(path.join(out, name));
        console.log(`Created ${name} (${size}x${size})`);
    }
    console.log('Done.');
})();
