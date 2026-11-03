import assert from 'node:assert/strict';
import test from 'node:test';
import { liveRoleHtml, experienceLabel, defaultDialCode, dialCodeLabel, loadLiveRole, initializeStickyApplication } from '../src/runtime/live-role.js';

const job = {
  id: 'a6a477f915ac86', code: 'JOB156', title: 'Builder <Key Accounts>', department: 'Retail',
  cities: Array.from({ length: 139 }, (_, i) => `City ${i + 1}`), country: 'India',
  locations: ['Delhi workplace <HQ>'], employmentType: 'Permanent', experienceFrom: '0', experienceTo: '12', experienceUnit: 'Years',
  description: '<h2>Responsibilities</h2><p>Complete published description.</p>',
  application: { supported: true, fields: [], resumeExtensions: ['pdf'], externalUrl: 'https://careers.cars24.com/role/?id=example' },
};

test('live detail retains the full description and every location beyond the compact hero summary', () => {
  const html = liveRoleHtml(job);
  assert.ok(html.includes(job.description));
  assert.match(html, /View all 139 cities/);
  for (const city of job.cities) assert.ok(html.includes(`<li>${city}</li>`));
  assert.match(html, /Builder &lt;Key Accounts&gt;/);
  assert.match(html, /0–12 Years/);
  assert.match(html, /JOB156/);
  assert.match(html, /Permanent/);
  assert.match(html, /View workplace details/);
  assert.match(html, /Delhi workplace &lt;HQ&gt;/);
});

test('application form is visible with one submit action and unavailable mappings never redirect applicants', () => {
  const html = liveRoleHtml(job);
  assert.match(html, /id="role-application-form" data-application-form aria-label="Apply for this role"/);
  assert.doesNotMatch(html, /data-application-form hidden|data-role-apply|Submit application/);
  assert.equal((html.match(/type="submit"/g) || []).length, 1);
  const right = html.split('<aside')[1];
  assert.doesNotMatch(right, /role-detail__facts|role-detail__summary|job-description|Your next chapter|role-detail__back/);
  const fallback = liveRoleHtml({ ...job, application: { ...job.application, supported: false } });
  assert.doesNotMatch(fallback, /data-application-form|type="submit"/);
  assert.doesNotMatch(fallback, /href="https:\/\/careers\.cars24\.com/);
  assert.match(fallback, /type="button" disabled/);
  assert.match(fallback, /Apply for this role/);
});

test('experience labels handle zero, equal bounds, missing bounds and tenant units', () => {
  assert.equal(experienceLabel({}), '');
  assert.equal(experienceLabel({ experienceFrom: '', experienceTo: undefined }), '');
  assert.equal(experienceLabel({ experienceFrom: '0', experienceTo: '0' }), '0 Years');
  assert.equal(experienceLabel({ experienceFrom: '3' }), '3+ Years');
  assert.equal(experienceLabel({ experienceTo: '6', experienceUnit: 'Months' }), 'Up to 6 Months');
});


test('combined phone control preserves the separate Darwinbox names and exact country option values', () => {
  const fields = [
    { key: 'phone_country_code', required: true, type: 'select', options: [{ value: '+91 India', label: '+91 India' }, { value: '+971 United Arab Emirates', label: 'UAE' }] },
    { key: 'phone', required: true, type: 'textfield' },
    { key: 'resume', required: true, type: 'attachment' },
  ];
  const html = liveRoleHtml({ ...job, application: { ...job.application, fields } });
  assert.equal((html.match(/class="application-phone"/g) || []).length, 1);
  assert.equal((html.match(/name="phone_country_code"/g) || []).length, 1);
  assert.equal((html.match(/name="phone"/g) || []).length, 1);
  assert.match(html, /value="\+91 India" selected>IND \+91<\/option>/);
  assert.match(html, /value="\+971 United Arab Emirates">UAE \+971<\/option>/);
  assert.match(html, /class="application-upload"/);
  assert.match(html, /name="resume" required/);
});

test('mapped location renders a visible editable select with the valid default and preserves option bytes', () => {
  const value = 'Gurgaon, Haryana\r, India (Office)';
  const fields = [{ key: 'confirmed_test_location_key', label: 'Applied for Location', displayLabel: 'Application location', purpose: 'application-location', type: 'select', required: true, defaultValue: value, options: [{ value, label: value }, { value: 'Delhi', label: 'Delhi' }] }];
  const html = liveRoleHtml({ ...job, application: { ...job.application, fields } });
  assert.match(html, /Application location/);
  assert.match(html, /<select id="apply-confirmed_test_location_key" name="confirmed_test_location_key" required>/);
  assert.match(html, /value="Gurgaon, Haryana&#13;, India \(Office\)" selected/);
  assert.match(html, /<option value="Delhi">Delhi<\/option>/);
  assert.doesNotMatch(html, /name="confirmed_test_location_key"[^>]*(?:disabled|hidden)/);
});


test('detail uses the card problem statement, preserves the official title and places the header before both columns',()=>{
  const html=liveRoleHtml({...job,title:'Builder - Evaluation Engineer',department:'Home Inspection'});
  assert.match(html,/<h1[^>]+>Help people trust the cars they buy<\/h1>/);
  assert.match(html,/<p class="role-detail__official-title">Builder - Evaluation Engineer<\/p>/);
  assert.match(html,/India <span aria-hidden="true">▪<\/span> Home Inspection/);
  assert.doesNotMatch(html,/craft-experiments__tags/);
  assert.ok(html.indexOf('</header>')<html.indexOf('class="container role-detail__layout"'));
});

test('dial-code defaults use approved values and keep every country selectable',()=>{
  const options=[{value:'+61 Australia',label:'+61 Australia'},{value:'+91 India',label:'+91 India'},{value:'+971 United Arab Emirates',label:'+971 United Arab Emirates'}];
  assert.equal(defaultDialCode({options},'India'),'+91 India');
  assert.equal(defaultDialCode({options},'UAE'),'+971 United Arab Emirates');
  assert.equal(defaultDialCode({options,defaultValue:'+61 Australia'},'India'),'+61 Australia');
  assert.equal(defaultDialCode({options},'Unknown'),'+91 India');
  assert.equal(defaultDialCode({options:[]},'India'),'');
});

test('live role shows a loader until details resolve and clears busy state on success and failure',async t=>{
  const keys=['document','matchMedia','fetch'];const original=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  t.after(()=>{for(const [key,value] of original){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  const retry={addEventListener(){}};
  const root={innerHTML:'',attrs:{},setAttribute(key,value){this.attrs[key]=value;},closest:()=>null,querySelectorAll:()=>[],querySelector:selector=>selector==='h1'?{id:'role-dialog-title'}:selector==='[data-role-retry]'?retry:null};
  Object.defineProperty(globalThis,'document',{configurable:true,value:{title:''}});
  Object.defineProperty(globalThis,'matchMedia',{configurable:true,value:()=>({matches:true})});
  let resolve;globalThis.fetch=()=>new Promise(done=>{resolve=done;});
  const controller=new AbortController();
  const loading=loadLiveRole(root,job.id,controller.signal);
  assert.match(root.innerHTML,/role-loading__spinner/);assert.equal(root.attrs['aria-busy'],'true');
  resolve(Response.json({job:{...job,application:{...job.application,supported:false}}}));await loading;
  assert.doesNotMatch(root.innerHTML,/role-loading__spinner/);assert.match(root.innerHTML,/role-detail__official-title/);assert.equal(root.attrs['aria-busy'],'false');
  globalThis.fetch=async()=>{throw new Error('Network failure');};
  await loadLiveRole(root,job.id,controller.signal);
  assert.match(root.innerHTML,/Role unavailable/);assert.match(root.innerHTML,/data-role-retry/);assert.equal(root.attrs['aria-busy'],'false');
  controller.abort();
});

test('long forms stay sticky without the removed toolbar and release observers on abort',t=>{
  const keys=['ResizeObserver','window','matchMedia'];const original=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  t.after(()=>{for(const [key,value] of original){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  let disconnected=false;
  Object.defineProperty(globalThis,'ResizeObserver',{configurable:true,value:class{observe(){}disconnect(){disconnected=true;}}});
  Object.defineProperty(globalThis,'window',{configurable:true,value:{addEventListener(){}}});
  Object.defineProperty(globalThis,'matchMedia',{configurable:true,value:()=>({matches:true})});
  const styles={};const aside={dataset:{},offsetHeight:1200,style:{setProperty(key,value){styles[key]=value;}}};
  const root={closest:()=>({clientHeight:600}),querySelector:()=>aside};
  const controller=new AbortController();initializeStickyApplication(root,controller.signal);
  assert.equal(aside.dataset.sticky,'true');assert.equal(styles['--role-form-max-height'],'496px');
  controller.abort();assert.equal(disconnected,true);
});


test('country labels stay compact while preserving every original submitted value', () => {
  assert.equal(dialCodeLabel({value:'+91 India',label:'+91 India'}), 'IND +91');
  assert.equal(dialCodeLabel({value:'+61 Australia',label:'+61 Australia'}), 'AUS +61');
  assert.equal(dialCodeLabel({value:'+971 United Arab Emirates',label:'UAE'}), 'UAE +971');
  assert.equal(dialCodeLabel({value:'+44 UK',label:'+44 United Kingdom'}), 'United Kingdom +44');
});

test('editable application fields have examples and submit uses the shared animated button', () => {
  const fields = ['firstname','lastname','email_id','phone'].map(key=>({key, required:true, type:'textfield'}));
  const html = liveRoleHtml({...job,application:{...job.application,fields}});
  for(const placeholder of ['First name','Last name','you@example.com','Mobile number']) {
    assert.ok(html.includes(`placeholder="${placeholder}"`));
  }
  assert.match(html, /class="craft-button btn-bubble-arrow btn-bubble-arrow--black application-submit" type="submit"/);
  assert.doesNotMatch(html, /application-submit" data-craft-static/);
});
