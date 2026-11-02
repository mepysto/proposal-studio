import test from 'node:test';
import assert from 'node:assert/strict';
import { facingPorts } from '../packages/pptx-renderer/connector-anchors.js';
test('facing ports attach to final bounds in both horizontal directions', () => {
  const a={x:1,y:2,w:3,h:2},b={x:5,y:2,w:3,h:2};
  assert.deepEqual(facingPorts(a,b),{start:[4,3],end:[5,3]});
  assert.deepEqual(facingPorts(b,a),{start:[5,3],end:[4,3]});
});
test('vertical ports preserve direction and center for unequal boxes', () => {
  const a={x:1,y:1,w:2,h:1},b={x:0,y:4,w:4,h:2};
  assert.deepEqual(facingPorts(a,b,'vertical'),{start:[2,2],end:[2,4]});
  assert.deepEqual(facingPorts(b,a,'vertical'),{start:[2,4],end:[2,2]});
  assert.throws(()=>facingPorts(a,{...a,x:2}));
});
