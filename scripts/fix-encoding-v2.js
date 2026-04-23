/**
 * Fix encoding in ecopools.html - second pass.
 *
 * JavaScript reads data-tag, data-title, data-description via textContent,
 * so HTML entities in those attributes would display literally (e.g. "&mdash;").
 * We need to restore raw Unicode in double-quoted data-* attribute values,
 * while keeping HTML entities in the visible text content (element bodies,
 * meta content attrs, title, aria-label etc.).
 *
 * Strategy:
 * 1. Find all double-quoted data-tag/title/description attribute values and
 *    restore HTML entities back to raw Unicode inside them.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'ecopools.html');
let content = fs.readFileSync(filePath, 'utf8');

// Decode HTML entities back to raw Unicode in data-tag/title/description values
const entityToChar = [
  ['&mdash;', '—'],
  ['&ndash;', '–'],
  ['&rsquo;', '’'],
  ['&lsquo;', '‘'],
  ['&ldquo;', '“'],
  ['&rdquo;', '”'],
  ['&nbsp;',  ' '],
];

// Match double-quoted values of data-tag, data-title, data-description
// These are the attrs consumed via textContent in JS
const dataAttrRegex = /(data-(?:tag|title|description)=")((?:[^"]|"")*?)(")/g;

content = content.replace(dataAttrRegex, (match, open, value, close) => {
  let restored = value;
  for (const [entity, char] of entityToChar) {
    restored = restored.split(entity).join(char);
  }
  if (restored !== value) {
    console.log(`Restored in ${open.slice(0,12)}: "${value.slice(0,60)}" -> "${restored.slice(0,60)}"`);
  }
  return open + restored + close;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done restoring data attribute values.');

// Verify: count raw chars in data attrs vs HTML entities in visible text
let rawCount = 0;
for (const [, char] of entityToChar) {
  rawCount += (content.split(char).length - 1);
}
console.log(`Raw Unicode chars (total in file): ${rawCount}`);
let entityCount = 0;
for (const [entity] of entityToChar) {
  entityCount += (content.split(entity).length - 1);
}
console.log(`HTML entities (total in file): ${entityCount}`);
