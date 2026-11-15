import test from 'node:test';
import assert from 'node:assert/strict';
import {footerRevealProgress} from '../src/runtime/society-footer.js';

test('footer reveal reaches its true end after changing content heights and viewport sizes',()=>{
  assert.equal(footerRevealProgress({top:955,height:955},955),0);
  assert.equal(footerRevealProgress({top:477.5,height:955},955),.5);
  assert.equal(footerRevealProgress({top:.55,height:955},955),1,'rounding at document end cannot leave a blue gap');
  assert.equal(footerRevealProgress({top:300,height:544},844),1,'a compact phone footer must finish before its unreachable top/top trigger');
  assert.equal(footerRevealProgress({top:-110,height:500},390),1,'short landscape reaches a complete reveal');
  assert.equal(footerRevealProgress({top:1200,height:955},955),0);
});
