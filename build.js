#!/usr/bin/env node
/**
 * build.js — Six Kingdoms copy injector
 *
 * Reads website-copy.md and injects each section's content into the matching
 * <!-- [[KEY]] --> ... <!-- [[/]] --> markers in the corresponding HTML files.
 *
 * Section-to-file mapping is determined by the "# PAGE: Name (filename.html)"
 * headers in website-copy.md.
 *
 * Usage:  node build.js
 * Called automatically by Vercel before each deployment.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Parse website-copy.md into a map of { key → { file, content } }
// ---------------------------------------------------------------------------
function parseMarkdown(mdPath) {
  const text  = fs.readFileSync(mdPath, 'utf8');
  const lines = text.split('\n');

  const sections    = {};
  let currentFile   = null;
  let currentKey    = null;
  let contentLines  = [];

  function flush() {
    if (currentKey && currentFile) {
      sections[currentKey] = {
        file:    currentFile,
        content: contentLines.join('\n').trim(),
      };
    }
    contentLines = [];
  }

  for (const line of lines) {
    // Page declaration:  # PAGE: Home (index.html)
    if (/^#\s+PAGE:/i.test(line)) {
      flush();
      currentKey = null;
      const m = line.match(/\(([^)]+\.html)\)/i);
      currentFile = m ? m[1] : null;
      continue;
    }

    // Section header:  ## HOME > HERO HEADLINE
    if (line.startsWith('## ')) {
      flush();
      currentKey = line.slice(3).trim();
      continue;
    }

    // Skip comment/divider lines that aren't content
    if (line.startsWith('---') || line.startsWith('# ===')) {
      continue;
    }

    // Accumulate content (only inside a section with a known file)
    if (currentKey !== null && currentFile !== null) {
      contentLines.push(line);
    }
  }

  flush();
  return sections;
}

// ---------------------------------------------------------------------------
// Inject sections into a single HTML file
// ---------------------------------------------------------------------------
function injectIntoHTML(htmlPath, sections) {
  if (!fs.existsSync(htmlPath)) {
    console.warn(`  SKIP  ${htmlPath} — file not found`);
    return;
  }

  let html        = fs.readFileSync(htmlPath, 'utf8');
  let changeCount = 0;
  const basename  = path.basename(htmlPath);

  for (const [key, { file, content }] of Object.entries(sections)) {
    if (file !== basename) continue;
    if (!content) continue; // nothing to inject

    // Escape the key so it's safe inside a regex
    const escapedKey = key.replace(/[[\]().*+?^${}|\\]/g, '\\$&');

    const regex = new RegExp(
      `(<!--\\s*\\[\\[${escapedKey}\\]\\]\\s*-->) *[\\s\\S]*?(<!--\\s*\\[\\[/\\]\\]\\s*-->)`,
      'g'
    );

    const updated = html.replace(regex, (_, open, close) => {
      changeCount++;
      return `${open}${content}${close}`;
    });

    html = updated;
  }

  fs.writeFileSync(htmlPath, html, 'utf8');
  if (changeCount > 0) {
    console.log(`  OK    ${htmlPath}  (${changeCount} section${changeCount === 1 ? '' : 's'} updated)`);
  } else {
    console.log(`  ----  ${htmlPath}  (no matching markers found)`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const mdPath = path.join(__dirname, 'website-copy.md');

if (!fs.existsSync(mdPath)) {
  console.error('ERROR: website-copy.md not found');
  process.exit(1);
}

console.log('\nSix Kingdoms — injecting copy from website-copy.md...\n');

const sections  = parseMarkdown(mdPath);
const htmlFiles = [...new Set(
  Object.values(sections)
    .map(s => s.file)
    .filter(Boolean)
)];

for (const file of htmlFiles) {
  injectIntoHTML(path.join(__dirname, file), sections);
}

console.log('\nDone.\n');
