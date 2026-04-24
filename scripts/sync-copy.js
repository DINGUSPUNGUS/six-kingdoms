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
    'ecological-design.html',
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
        .replace(/&copy;/g,   '\u00A9')
        .replace(/&reg;/g,    '\u00AE')
        .replace(/&deg;/g,    '\u00B0')
        .replace(/&times;/g,  '\u00D7')
        .replace(/&divide;/g, '\u00F7')
        .replace(/&euro;/g,   '\u20AC')
        .replace(/&sect;/g,   '\u00A7')
        .replace(/&curren;/g, '\u00A4')
        .trim();
}

function validateAnchors(copyMap) {
    const anchorPattern = /<!-- \[\[([^\]]+)\]\] -->/g;

    for (const file of HTML_FILES) {
        const fp = path.join(ROOT, file);
        if (!fs.existsSync(fp)) {
            console.warn(`WARN: Missing target file: ${file}`);
            continue;
        }

        const html = fs.readFileSync(fp, 'utf8');
        const missing = [];
        const seen = new Set();
        let m;

        while ((m = anchorPattern.exec(html)) !== null) {
            const label = m[1].trim();
            if (label === '/' || seen.has(label)) continue;
            seen.add(label);
            if (!(label in copyMap)) {
                missing.push(label);
            }
        }

        if (missing.length) {
            console.warn(`WARN: ${file} has anchor labels missing in website-copy.md:`);
            missing.forEach((label) => console.warn(`  - ${label}`));
        }
    }
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

    validateAnchors(copy);

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
