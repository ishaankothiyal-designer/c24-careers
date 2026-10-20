#!/usr/bin/env node
// Deployment-only transformation. Original src/ and public/ remain byte-identical to Backup V2.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] || '/c24-careers/';
if (!/^\/(?:[A-Za-z0-9._-]+\/)*$/.test(base)) throw new Error('Expected an absolute path ending in /');
const output = path.join(project, 'dist/client');
const entries = await readdir(path.join(project, 'public'), {withFileTypes:true});
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const roots = ['assets/', ...entries.map(entry => entry.name + (entry.isDirectory() ? '/' : ''))];
// A real local absolute URL begins at a literal/CSS/HTML boundary. Exclude host/path prefixes
// so external URLs, protocol-relative URLs, regexes, and already-prefixed URLs stay unchanged.
const pattern = new RegExp('(?<![A-Za-z0-9_:/.-])/(?:' + roots.map(escape).join('|') + ')', 'g');
let changed = 0;
async function visit(dir) {
  for (const entry of await readdir(dir, {withFileTypes:true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await visit(file);
    else if (/\.(?:html|css|js|mjs|json|svg|webmanifest|txt)$/.test(entry.name)) {
      const before = await readFile(file, 'utf8');
      const after = before.replace(pattern, match => base + match.slice(1));
      if (after !== before) { await writeFile(file, after); changed++; }
    }
  }
}
await visit(output);
await writeFile(path.join(output, '.nojekyll'), '');
console.log(`GitHub Pages asset base ${base}: updated ${changed} generated files; source unchanged.`);
