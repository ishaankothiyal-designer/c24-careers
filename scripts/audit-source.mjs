// Conservative inventory, not a CSS purger. Dynamic selectors require browser
// coverage before deletion; a static candidate is not proof that a rule is dead.
import {readFile,readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>readFile(path.join(root,file),'utf8');
async function walk(directory){const files=[];for(const item of await readdir(path.join(root,directory),{withFileTypes:true})){const name=directory+'/'+item.name;if(item.isDirectory())files.push(...await walk(name));else files.push(name);}return files;}
const sourceFiles=await walk('src');
const index=JSON.parse(await read('src/sections.json'));
const selected=index.map(item=>'src/sections/'+item.file);
const activeNavbar=(await read('src/navbar-config.js')).match(/ACTIVE_NAVBAR\s*=\s*'([^']+)'/)?.[1];
const inert=index.filter(item=>item.navbarVersion&&item.navbarVersion!==activeNavbar).map(item=>'src/sections/'+item.file);
const inactive=sourceFiles.filter(file=>file.endsWith('.html')&&!selected.includes(file));
const runtimeFiles=[...sourceFiles.filter(file=>/\.(js|jsx|json)$/.test(file)),...selected,'index.html',...(await walk('public')).filter(file=>file.endsWith('.js'))];
const runtime=await Promise.all(runtimeFiles.map(read));
const identifiers=new Set(runtime.join('\n').match(/[A-Za-z_][\w-]*/g));
const cssFiles=[...sourceFiles.filter(file=>file.endsWith('.css')),...(await walk('public/_astro')).filter(file=>file.endsWith('.css'))];
const cssCandidates=[];
for(const file of cssFiles){const css=await read(file);const classes=[...new Set([...css.matchAll(/(?<![\w-])\.([A-Za-z_][\w-]*)/g)].map(match=>match[1]))];const candidates=classes.filter(name=>!identifiers.has(name));if(candidates.length)cssCandidates.push({file,classes:candidates});}
const external=[];
for(let i=0;i<runtimeFiles.length;i++){
  // Only authored active fragments/runtime: library license URLs and SVG XML
  // namespaces are not evidence of outgoing browser requests.
  if(runtimeFiles[i].startsWith('public/') || runtimeFiles[i].endsWith('sections.json') || inert.includes(runtimeFiles[i]))continue;
  for(const url of new Set(runtime[i].match(/https?:\/\/[^\s"'`<>\\)]+/g)||[])){
    if(url==='http://www.w3.org/2000/svg')continue;
    external.push({file:runtimeFiles[i],url,kind:url.includes('avatars.slack-edge.com')?'remote portrait':url.includes('careers.cars24.com')?'outbound application link':'review'});
  }
}
const report={method:'Static inventory only. Candidates may be used by dynamic DOM, responsive states, or third-party runtime; do not automatically delete.',inactiveFragments:inactive,inertReferenceFragments:inert,cssCandidates,externalReferences:external};
if(process.argv.includes('--write'))await writeFile(path.join(root,'docs/source-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({inactiveFragments:inactive.length,cssFiles:cssFiles.length,cssCandidateClasses:cssCandidates.reduce((sum,item)=>sum+item.classes.length,0),externalReferences:external},null,2));
