import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { hash, publish, safeName } from '../scripts/publish.mjs';

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-publish-'));
  const stage = path.join(root, 'stage');
  await mkdir(path.join(stage, 'static/redesign'), { recursive: true });
  await writeFile(path.join(root, 'index.html'), 'old home');
  await writeFile(path.join(root, '404.html'), 'old 404');
  await writeFile(path.join(root, '.portfolio-output.json'), JSON.stringify({ version: 1, files: { 'index.html': hash('old home'), '404.html': hash('old 404') } }));
  await writeFile(path.join(stage, 'index.html'), 'new home');
  await writeFile(path.join(stage, '404.html'), 'new 404');
  await writeFile(path.join(stage, 'static/redesign/app.js'), 'app');
  return { root, stage };
}

test('safeName rejects traversal and unapproved paths', () => {
  assert.throws(() => safeName('../index.html'));
  assert.throws(() => safeName('static/images/legacy.png'));
  assert.equal(safeName('case-studies/case-study-cultura.html'), 'case-studies/case-study-cultura.html');
});

test('publish updates owned output and records new generated files', async () => {
  const { root, stage } = await fixture();
  try {
    const result = await publish({ root, stage });
    assert.equal(result.changed, 3);
    assert.equal(await readFile(path.join(root, 'index.html'), 'utf8'), 'new home');
    assert.equal(await readFile(path.join(root, 'static/redesign/app.js'), 'utf8'), 'app');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('publish refuses to overwrite a manually changed owned page', async () => {
  const { root, stage } = await fixture();
  try {
    await writeFile(path.join(root, 'index.html'), 'manual change');
    await assert.rejects(() => publish({ root, stage }), /Locally changed output/);
    assert.equal(await readFile(path.join(root, 'index.html'), 'utf8'), 'manual change');
  } finally { await rm(root, { recursive: true, force: true }); }
});
