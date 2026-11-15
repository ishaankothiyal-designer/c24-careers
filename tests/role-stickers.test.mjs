import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {roleSticker} from '../src/role-stickers.js';
import {liveJobCard} from '../src/runtime/live-jobs.js';
import {roleSummary} from '../src/role-problems.js';

const subjects=[
  ['Evaluation Engineer','inspection'],['Key Accounts','dealer-network'],
  ['Retail Associate','customer-calls'],['Procurement Associate','dealer-auctions'],
  ['Listing','car-listing'],['Closure','purchase-completion'],['Procurement','inspection-review'],
];

test('reviewed work receives distinct self-contained artwork on both card surfaces',()=>{
  const paths=new Set();
  for(const [title,subject] of subjects){
    const job={id:'reviewed-job',title:`Builder - ${title}`,department:'Retail'};
    const path=roleSticker(job);paths.add(path);
    assert.equal(path,`/img/stickers/roles/${subject}.svg`);
    assert.ok(existsSync(new URL(`../public${path}`,import.meta.url)));
    const svg=readFileSync(new URL(`../public${path}`,import.meta.url),'utf8');
    assert.match(svg,/viewBox="0 0 96 96"/);
    assert.doesNotMatch(svg,/<(?:script|image|text|foreignObject)\b|\bon\w+\s*=|\bhref\s*=/i);
    for(const listing of [false,true]){
      const html=liveJobCard(job,listing);
      assert.equal((html.match(/class="role-card__sticker"/g)||[]).length,1);
      assert.ok(html.includes(`src="${path}" alt="" aria-hidden="true"`));
      assert.ok(html.includes(roleSummary(job)));
      assert.match(html,/View role details/);
      assert.equal((html.match(/<a\b/g)||[]).length,1);
    }
  }
  assert.equal(paths.size,7);
});

test('normalization preserves job scope when departments overlap',()=>{
  assert.equal(roleSticker({title:'  BUILDER  –  KEY ACCOUNTS '}),roleSticker({title:'Builder - Key Accounts'}));
  assert.match(roleSticker({title:'Builder-Procurement Associate',department:'Procurement'}),/dealer-auctions\.svg$/);
  assert.match(roleSticker({title:'Builder — Procurement',department:'Sales'}),/inspection-review\.svg$/);
});

test('unreviewed and unsafe titles use a neutral local asset without guessing responsibilities',()=>{
  for(const job of [null,{}, {title:'New Procurement Lead',department:'Procurement'}, {title:'../../secret'}, {title:'constructor'}, {title:'__proto__'}, {title:'<svg onload=alert(1)>'}]){
    assert.equal(roleSticker(job),'/img/stickers/roles/work.svg');
  }
  assert.ok(existsSync(new URL('../public/img/stickers/roles/work.svg',import.meta.url)));
});
