/**
 * Fix encoding issues in ecopools.html.
 * Replace literal Unicode typographic characters in visible HTML text content
 * with proper HTML entities. Must NOT alter JSON inside data-gallery / data-description
 * attribute values (those span single-quoted attribute strings).
 *
 * Strategy: split by single-quoted attribute boundaries so we only touch content
 * outside data attributes that hold raw JSON.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'ecopools.html');
let content = fs.readFileSync(filePath, 'utf8');

// Characters to replace -> HTML entity
// Only apply outside of data-gallery / data-description / data-tag / data-title
// attribute values (all use single-quote delimiters in this file)
const replacements = [
  ['—', '&mdash;'],   // em dash —
  ['–', '&ndash;'],   // en dash –
  ['’', '&rsquo;'],   // right single quote / curly apostrophe '
  ['‘', '&lsquo;'],   // left single quote '
  ['“', '&ldquo;'],   // left double quote "
  ['”', '&rdquo;'],   // right double quote "
  [' ', '&nbsp;'],    // non-breaking space
];

// Split on single-quoted attribute values to avoid touching JSON data
// Pattern: we split the file into segments that alternate between
// "outside single-quote attributes" and "inside single-quote attributes"
// Single-quoted attributes in this file look like: ='...' or ='[...]'
// We identify them by: (?<==')[^']*'  — but we need to be careful about
// apostrophes in regular content.
//
// Safer approach: only replace in segments that are NOT inside data-*=' ' attr values.
// We detect data-*='...' blocks as regions NOT to touch.
// Use a tokeniser that identifies <tag ...data-xxx='...'>  attribute regions.

// Actually, the safest approach for this specific file:
// The JSON data-attribute values use single quotes. Regular visible content
// doesn't have the pattern data-xxx='...' so we split on data attribute boundaries.

// We'll use a regex to split on single-quoted attribute values attached to data- attributes
// and only replace in non-attribute segments.

let result = '';
// Regex: match single-quoted attribute values of data- attributes
// Captures the full attribute assignment so we can restore it verbatim
const attrRegex = /(data-[\w-]+='[^']*')/gs;

let lastIndex = 0;
let match;
while ((match = attrRegex.exec(content)) !== null) {
  // Process the text segment BEFORE this attribute (apply replacements)
  let segment = content.slice(lastIndex, match.index);
  for (const [char, entity] of replacements) {
    segment = segment.split(char).join(entity);
  }
  result += segment;
  // Append the attribute value UNCHANGED
  result += match[0];
  lastIndex = match.index + match[0].length;
}
// Process the tail
let tail = content.slice(lastIndex);
for (const [char, entity] of replacements) {
  tail = tail.split(char).join(entity);
}
result += tail;

fs.writeFileSync(filePath, result, 'utf8');
console.log('Encoding fix applied to ecopools.html');

// Count remaining raw chars
let remaining = 0;
for (const [char] of replacements) {
  remaining += (result.split(char).length - 1);
}
console.log(`Remaining raw typographic chars: ${remaining}`);
