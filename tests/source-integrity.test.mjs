import assert from 'node:assert/strict';
import {readFile,access,readdir} from 'node:fs/promises';
import test from 'node:test';

test('explicit fragment imports match the editable section index',async()=>{
  const index=JSON.parse(await readFile(new URL('../src/sections.json',import.meta.url),'utf8'));
  const source=await readFile(new URL('../src/page-sections.js',import.meta.url),'utf8');
  const imports=[...source.matchAll(/from '\.\/sections\/([^']+)\?raw'/g)].map(match=>match[1]);
  assert.deepEqual(imports,index.map(item=>item.file));
  assert.equal(new Set(imports).size,imports.length);
});

test('retained native runtime imports point to files in this checkout',async()=>{
  const directory=new URL('../public/_astro/',import.meta.url);
  for(const filename of await readdir(directory)){
    if(!filename.endsWith('.js'))continue;
    const source=await readFile(new URL(filename,directory),'utf8');
    for(const [,specifier] of source.matchAll(/from\s*["'`]([^"'`]+)["'`]/g)){
      if(specifier.startsWith('./'))await access(new URL(specifier,directory));
    }
  }
});
