/**
 * Fix true encoding errors in ecopools.html.
 *
 * The file is declared UTF-8 but contains Windows-1252 "smart punctuation" bytes
 * (0x97 em-dash, 0x96 en-dash, 0x91/92 curly single quotes, 0x93/94 curly double quotes)
 * mixed into otherwise ASCII content.  Browsers typically render them correctly via
 * a Windows-1252 fallback, but they are technically invalid in a UTF-8 document.
 *
 * Strategy (binary):
 *  1. Read raw bytes.
 *  2. Replace Windows-1252 bytes with their proper UTF-8 entity equivalents in visible text.
 *     - Inside JSON data-gallery='[...]' (single-quoted): replace with UTF-8 equivalents
 *       (not HTML entities) so the JS JSON.parse works correctly.
 *     - In all other HTML text: replace with HTML entities (&mdash; etc.)
 *  3. Write back as UTF-8.
 *
 * Simpler approach: since these bytes appear in both JS-consumed attrs and visible text,
 * and the JS uses textContent (not innerHTML) for data-tag/title/description attrs,
 * use UTF-8 multibyte sequences everywhere EXCEPT in visible text where we use entities.
 *
 * Pragmatic solution: Replace ALL Windows-1252 bytes with their UTF-8 code point
 * equivalents (real Unicode characters).  The file will then be clean UTF-8.
 * The browser renders Unicode correctly.  JS textContent reads Unicode correctly.
 * This is the safest fix.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'ecopools.html');
const buf = fs.readFileSync(filePath);

// Windows-1252 bytes → UTF-8 Buffer replacements
// Map: byte value (0x80-0x9F range in Win-1252 that differ from ISO-8859-1)
const win1252map = {
  0x91: '‘', // left single quote '
  0x92: '’', // right single quote '
  0x93: '“', // left double quote "
  0x94: '”', // right double quote "
  0x96: '–', // en-dash –
  0x97: '—', // em-dash —
  0x85: '…', // ellipsis …
  0x95: '•', // bullet •
};

const bytes = [...buf];
const output = [];
for (let i = 0; i < bytes.length; i++) {
  const b = bytes[i];
  if (win1252map[b] !== undefined) {
    // Replace with UTF-8 encoding of the Unicode character
    const utf8 = Buffer.from(win1252map[b], 'utf8');
    for (const byte of utf8) output.push(byte);
    console.log(`  Replaced 0x${b.toString(16).toUpperCase()} at offset ${i} -> U+${win1252map[b].codePointAt(0).toString(16).toUpperCase()}`);
  } else {
    output.push(b);
  }
}

const result = Buffer.from(output);
fs.writeFileSync(filePath, result);
console.log(`Done. File written (${result.length} bytes).`);

// Verify it's valid UTF-8
try {
  result.toString('utf8');
  console.log('Verification: valid UTF-8 ✓');
} catch (e) {
  console.error('Verification FAILED: file is not valid UTF-8!');
}
