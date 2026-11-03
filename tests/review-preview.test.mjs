import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../preview/worker.js';

test('review preview forwards only public job reads without visitor credentials',async t=>{
  let upstream,options;
  t.mock.method(globalThis,'fetch',async(url,init)=>{upstream=String(url);options=init;return Response.json({jobs:[]});});
  const response=await worker.fetch(new Request('https://preview.test/api/jobs?secret=ignored',{headers:{Cookie:'private',Authorization:'Bearer private'}}),{});
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{jobs:[]});
  assert.equal(upstream,'https://c24-careers-chi.vercel.app/api/jobs');
  assert.deepEqual(options.headers,{Accept:'application/json'});
  assert.equal(options.redirect,'manual');
});

test('review preview works on hosts without AbortSignal.timeout',async t=>{
  t.mock.method(AbortSignal,'timeout',()=>{throw new Error('Unsupported runtime method');});
  t.mock.method(globalThis,'fetch',async()=>Response.json({jobs:[{id:'a123',title:'Builder'}]}));
  const response=await worker.fetch(new Request('https://preview.test/api/jobs'),{});
  assert.equal(response.status,200);
  assert.equal((await response.json()).jobs[0].id,'a123');
});

test('review preview blocks application writes and unexpected endpoints',async t=>{
  t.mock.method(globalThis,'fetch',()=>assert.fail('Must not contact a live service'));
  for(const [path,method,status] of [['/api/applications','POST',403],['/api/private','GET',404]]) {
    const response=await worker.fetch(new Request('https://preview.test'+path,{method}),{});
    assert.equal(response.status,status);
  }
});

test('review preview reports unavailable upstream data without exposing upstream responses',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('<html>Unexpected response</html>',{headers:{'content-type':'text/html'}}));
  const response=await worker.fetch(new Request('https://preview.test/api/jobs/a123'),{});
  assert.equal(response.status,502);assert.doesNotMatch(await response.text(),/<html>/);
});

test('review preview serves direct frontend routes through the app shell',async()=>{
  const paths=[];
  const response=await worker.fetch(new Request('https://preview.test/careers/roles/a123/',{headers:{Accept:'text/html'}}),{ASSETS:{fetch:async request=>{const path=new URL(request.url).pathname;paths.push(path);return new Response(path==='\/index.html'?'app':'missing',{status:path==='/index.html'?200:404});}}});
  assert.equal(response.status,200);assert.deepEqual(paths,['/careers/roles/a123/','/index.html']);
});

test('review preview rejects upstream redirects without following them',async t=>{
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    assert.equal(options.redirect,'manual');
    return new Response(null,{status:302,headers:{Location:'https://other.test/'}});
  });
  const response=await worker.fetch(new Request('https://preview.test/api/jobs'),{});
  assert.equal(response.status,502);
});
