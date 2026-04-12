#!/usr/bin/env node
// sync-copy.js — Six Kingdoms website copy sync
//
// Reads website-copy.md and updates HTML files in-place.
// Uses only Node.js built-ins — no npm install needed.
//
// Usage: node scripts/sync-copy.js

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const COPY_FILE = path.join(ROOT, 'website-copy.md');
const HTML_FILES = [
    'index.html',
    'ecopools.html',
    'land-management.html',
    'contact.html',
];

// Decode HTML entities so markdown plain text matches the HTML anchor content
function decodeHtml(str) {
    return str
        .replace(/&mdash;/g,  '\u2014')
        .replace(/&ndash;/g,  '\u2013')
        .replace(/&middot;/g, '\u00B7')
        .replace(/&rarr;/g,   '\u2192')
        .replace(/&larr;/g,   '\u2190')
        .replace(/&amp;/g,    '&')
        .replace(/&lt;/g,     '<')
        .replace(/&gt;/g,     '>')
        .replace(/&quot;/g,   '"')
        .replace(/&rsquo;/g,  '\u2019')
        .replace(/&lsquo;/g,  '\u2018')
        .replace(/&rdquo;/g,  '\u201D')
        .replace(/&ldquo;/g,  '\u201C')
        .replace(/&nbsp;/g,   ' ')
        .trim();
}

// Parse website-copy.md into { label: value } map
function parseCopy(content) {
    const map    = {};
    const blocks = content.split(/^(?=## )/m);

    for (const block of blocks) {
        if (!block.startsWith('## ')) continue;

        const lines = block.split('\n');
        const label = lines[0].slice(3).trim();
        let   rest  = lines
            .slice(1)
            .filter(l => !/^#{1,2} /.test(l) && l.trim() !== '---');

        while (rest.length && !rest[0].trim())       rest.shift();
        while (rest.length && !rest[rest.length - 1].trim()) rest.pop();

        if (label && rest.length) {
            map[label] = rest.join('\n');
        }
    }

    return map;
}

function run() {
    if (!fs.existsSync(COPY_FILE)) {
        console.error('website-copy.md not found at', COPY_FILE);
        process.exit(1);
    }

    const copy    = parseCopy(fs.readFileSync(COPY_FILE, 'utf8'));
    const pattern = /<!-- \[\[([^\]]+)\]\] -->([\s\S]*?)<!-- \[\[\/\]\] -->/g;
    let   total   = 0;

    for (const file of HTML_FILES) {
        const fp = path.join(ROOT, file);
        if (!fs.existsSync(fp)) continue;

        const original = fs.readFileSync(fp, 'utf8');
        let   changed  = false;

        const updated = original.replace(pattern, (match, rawLabel, current) => {
            const label = rawLabel.trim();
            if (!(label in copy)) return match;

            const next    = copy[label];
            const decoded = decodeHtml(current);

            if (next === decoded) return match;

            changed = true;
            total++;
            console.log(`  [${file}] "${label}"`);
            return `<!-- [[${rawLabel}]] -->${next}<!-- [[/]] -->`;
        });

        if (changed) {
            fs.writeFileSync(fp, updated, 'utf8');
        }
    }

    if (total > 0) {
        console.log(`\n${total} section(s) updated.`);
    } else {
        console.log('No changes detected.');
    }
}

run();
