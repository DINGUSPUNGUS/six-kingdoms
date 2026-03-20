#!/usr/bin/env node
/**
 * copy-sync.js — Six Kingdoms website copy watcher
 *
 * Watches website-copy.md for changes and automatically updates HTML files.
 *
 * Usage:  node copy-sync.js
 *
 * In HTML files, mark editable text with comment anchors:
 *   <!-- [[LABEL]] -->your text here<!-- [[/]] -->
 *
 * The label must exactly match a "## LABEL" heading in website-copy.md.
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = __dirname;
const COPY_FILE = path.join(ROOT, 'website-copy.md');

const HTML_FILES = [
  'index.html',
  'ecopools.html',
  'land-management.html',
  'contact.html',
  'living-water-future-of-swimming.html',
  'fynbos-restoration-reading-landscape.html',
  'knowing-your-land-stewardship.html',
];

// Matches: <!-- [[LABEL]] -->...content...<!-- [[/]] -->
const ANCHOR = /<!-- \[\[([^\]]+)\]\] -->([\s\S]*?)<!-- \[\[\/\]\] -->/g;

// Decode HTML entities so markdown plain text can match HTML anchor content
function decode(str) {
  return str
    .replace(/&mdash;/g,  '—')
    .replace(/&ndash;/g,  '–')
    .replace(/&middot;/g, '·')
    .replace(/&rarr;/g,   '→')
    .replace(/&larr;/g,   '←')
    .replace(/&amp;/g,    '&')
    .replace(/&lt;/g,     '<')
    .replace(/&gt;/g,     '>')
    .replace(/&quot;/g,   '"')
    .replace(/&rsquo;/g,  '\u2019')
    .replace(/&lsquo;/g,  '\u2018')
    .replace(/&rdquo;/g,  '\u201D')
    .replace(/&ldquo;/g,  '\u201C')
    .replace(/&nbsp;/g,   '\u00A0')
    .trim();
}

/** Parse website-copy.md → { label: rawValue } */
function parseCopy(md) {
  const map = {};
  const blocks = md.split(/\n(?=## )/);

  for (const block of blocks) {
    const lines = block.split('\n');
    if (!lines[0].startsWith('## ')) continue;

    const label = lines[0].slice(3).trim();
    let rest = lines.slice(1);

    // Drop lines that are top-level headings (# or ##) or horizontal rules
    rest = rest.filter(l => !l.match(/^#{1,2} /) && l.trim() !== '---');

    // Trim blank lines from both ends
    while (rest.length && !rest[0].trim())                rest.shift();
    while (rest.length && !rest[rest.length - 1].trim())  rest.pop();

    if (label && rest.length) map[label] = rest.join('\n');
  }

  return map;
}

/** Apply copy values to all HTML files */
function sync() {
  if (!fs.existsSync(COPY_FILE)) {
    console.error('website-copy.md not found');
    return;
  }

  const copy    = parseCopy(fs.readFileSync(COPY_FILE, 'utf8'));
  const time    = new Date().toLocaleTimeString();
  let   changed = 0;

  for (const file of HTML_FILES) {
    const fp = path.join(ROOT, file);
    if (!fs.existsSync(fp)) continue;

    let html        = fs.readFileSync(fp, 'utf8');
    let fileChanged = false;

    html = html.replace(ANCHOR, (match, label, current) => {
      const key = label.trim();
      if (!(key in copy)) return match;

      const next           = copy[key];
      const currentDecoded = decode(current);

      if (next === currentDecoded) return match;   // no change

      fileChanged = true;
      changed++;
      console.log(`  [${file}] "${key}"`);
      return `<!-- [[${key}]] -->${next}<!-- [[/]] -->`;
    });

    if (fileChanged) fs.writeFileSync(fp, html, 'utf8');
  }

  if (changed) {
    console.log(`[${time}] ${changed} section(s) updated.\n`);
  } else {
    console.log(`[${time}] No changes detected.\n`);
  }
}

// ── Run ──────────────────────────────────────────────────────────────────────

console.log('┌─────────────────────────────────────────┐');
console.log('│  Six Kingdoms — Copy Sync               │');
console.log('│  Watching website-copy.md for changes   │');
console.log('│  Ctrl+C to stop                         │');
console.log('└─────────────────────────────────────────┘\n');

sync();   // run once immediately

fs.watchFile(COPY_FILE, { interval: 300 }, (curr, prev) => {
  if (curr.mtime > prev.mtime) sync();
});
