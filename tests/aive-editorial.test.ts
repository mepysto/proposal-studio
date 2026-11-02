import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';
import { Project } from '../packages/core/schema.js';
import { render } from '../packages/pptx-renderer/index.js';

test('Aive latency comparison retains estimate status and one unit', async () => {
  const p=Project.parse(JSON.parse(await fs.readFile('examples/aive-pro.project.json','utf8')));
  const d=p.quantitativeDatasets.find(d=>d.id==='board-latency-fps')!;
  assert.equal(d.unit,'ms');
  assert.ok(d.limitation.includes('계산값'));
  assert.ok(d.rows.every(r=>r.series.includes('추정')));
  assert.deepEqual(d.rows.filter(r=>r.series==='Pro 즉시 경보 (추정)').map(r=>r.value),[70,140]);
});

test('Aive association bus has no arrowheads and supplied capture has no invented recognition boxes', async () => {
  const p=Project.parse(JSON.parse(await fs.readFile('examples/aive-pro.project.json','utf8')));
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'aive-editorial-test-'));
  try {
    const busFile=path.join(dir,'bus.pptx');
    const bus=await render(p,busFile,'s05-goals-hardware-scope');
    const zip=await JSZip.loadAsync(await fs.readFile(busFile));
    const xml=await zip.file('ppt/slides/slide1.xml')!.async('string');
    assert.doesNotMatch(xml,/<a:(?:headEnd|tailEnd)[^>]*type="(?:triangle|arrow)"/);
    assert.ok(bus.elements.some(e=>e.semanticConnector));
    const capture=await render(p,path.join(dir,'screen.pptx'),'s17-ui-admin-zone-edit');
    assert.ok(capture.elements.some(e=>e.kind==='image' && e.image?.path.endsWith('05_zone_edit.png')));
    assert.ok(!capture.elements.some(e=>e.displayObjectId==='adm-pin' || e.displayObjectId==='adm-mag'));
    assert.equal(p.slides.find(s=>s.id==='s17-ui-admin-zone-edit')!.reasoning!.visualPlan!.interfaceExample!.image!.origin,'user-provided');
  } finally { await fs.rm(dir,{recursive:true,force:true}); }
});
