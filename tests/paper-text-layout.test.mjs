import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {fitPaperText} from '../src/runtime/paper-text-layout.js';

const html=await readFile(new URL('../src/sections/career-06-letter.html',import.meta.url),'utf8');
const paragraphs=[...html.matchAll(/<p data-paper-paragraph="">([^<]+)<\/p>/g)].map(match=>match[1]);
function blocks(bodySize,lineHeight){
  const style={fontFamily:'sans-serif',fontWeight:'400',color:'#151515',spacing:'normal',marginTop:0,marginBottom:0};
  return [
    {...style,text:'VIKRAM’S LETTER · AN EXCERPT',fontSize:10,lineHeight:15,marginBottom:28},
    ...paragraphs.map(text=>({...style,text,fontSize:bodySize,lineHeight,marginBottom:24,body:true})),
    {...style,text:'Vikram Chopra',fontSize:34,lineHeight:54.4,marginTop:16,signature:true},
  ];
}
// Deterministic proportional metrics exercise wrapping and fitted bounds. The
// scene supplies actual loaded-font canvas measurements through the same API.
const measure=(text,metrics)=>text.length*metrics.fontSize*.48;

for(const [label,box,size,lineHeight,expectShrink] of [
  ['tablet',{width:382,height:540,paddingInline:28,paddingTop:48,paddingBottom:28},18,32.4,true],
  ['desktop',{width:540,height:764,paddingInline:38.4,paddingTop:62.4,paddingBottom:38.4},20,37,false],
]){
  test(`letter ink retains every paragraph and signature within ${label} texture bounds`,()=>{
    const result=fitPaperText(blocks(size,lineHeight),box,measure);
    assert.equal(paragraphs.length,3);
    assert.equal(result.lines.filter(line=>line.body).map(line=>line.line).join(' '),paragraphs.join(' '));
    assert.deepEqual(result.lines.filter(line=>line.signature).map(line=>line.line),['Vikram Chopra']);
    assert.ok(result.inkBottom<=box.height-box.paddingBottom);
    assert.ok(result.lines.every(line=>line.y+line.lineHeight<=box.height-box.paddingBottom));
    assert.ok(result.lines.every(line=>line.width<=box.width-box.paddingInline*2));
    assert.equal(result.fits,true);
    if(expectShrink){assert.ok(result.scale<1);assert.ok(result.scale>.65);}
    else assert.equal(result.scale,1);
  });
}
