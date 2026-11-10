// Optional asset preparation; not part of the application build.
// Run: node scripts/prepare-ambition-motion.mjs (requires ffmpeg on PATH).
import {spawnSync} from 'node:child_process';
import {writeFile,mkdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'public/media/ambition');
const definitions=[
  ['leap','edeae7','0.065:0.020'],
  ['collaborator','442cfc','0.055:0.020'],
  ['folding-track','dbd7fc','0.050:0.020'],
  ['workshops','95f75f','0.065:0.020'],
  ['pavilion','141522','0.035:0.015'],
];
const run=args=>{
  const result=spawnSync('ffmpeg',['-v','error',...args],{cwd:root,maxBuffer:8*1024*1024});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error(result.stderr.toString());
  return result.stdout;
};
await mkdir(output,{recursive:true});
const records=[];
for(const [index,[id,key,tolerance]] of definitions.entries()){
  const source='design/ambition-motion/sources/concept-'+(index+1)+'.gif';
  const video='public/media/ambition/'+id+'.mp4';
  const poster='public/media/ambition/'+id+'.png';
  // Chroma-key the original noisy backdrop, then composite onto a single flat
  // surface. Unlike CSS blending this preserves the lime accents and pale fills.
  const filter='[0:v]format=rgba,colorkey=0x'+key+':'+tolerance+'[art];color=c=0x'+key+':s=640x512:r=25[bg];[bg][art]overlay=shortest=1:format=auto,tpad=start_mode=clone:start_duration=0.2:stop_mode=clone:stop_duration=2,trim=duration=4,setpts=PTS-STARTPTS,fade=t=in:st=0:d=0.2:color=0x'+key+',fade=t=out:st=3.6:d=0.4:color=0x'+key+',scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=range=limited:color_primaries=bt709:color_trc=iec61966-2-1:colorspace=bt709[v]';
  run(['-y','-i',source,'-filter_complex',filter,'-map','[v]','-an','-c:v','libx264','-preset','slow','-crf','14','-colorspace','bt709','-color_primaries','bt709','-color_trc','iec61966-2-1','-color_range','tv','-movflags','+faststart+write_colr',video]);
  const raw=run(['-i',video,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-']);
  const counts=new Map();
  for(const y of [0,511])for(let x=0;x<640;x++){
    const offset=(y*640+x)*3;
    const colour=raw.subarray(offset,offset+3).toString('hex');
    counts.set(colour,(counts.get(colour)||0)+1);
  }
  const background='#'+[...counts].sort((a,b)=>b[1]-a[1])[0][0];
  // A late frame keeps the completed idea visible with reduced motion.
  run(['-y','-ss','3.12','-i',video,'-frames:v','1','-compression_level','9',poster]);
  records.push({id,background,video:'/media/ambition/'+id+'.mp4',poster:'/media/ambition/'+id+'.png',source,bytes:(await stat(path.join(root,video))).size,posterBytes:(await stat(path.join(root,poster))).size});
}
await writeFile(path.join(root,'src/ambition-motion-assets.json'),JSON.stringify(records,null,2)+'\n');
console.log(records.map(x=>x.id+' '+x.background+' '+x.bytes+' bytes').join('\n'));

