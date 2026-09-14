import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { requiredFiles, validateOutput } from '../scripts/validate-output.mjs';

test('validation rejects a missing required route', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-validate-'));
  try {
    await assert.rejects(() => validateOutput(root), /Missing required output/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('validation catches broken local media', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-validate-'));
  try {
    for (const file of requiredFiles) {
      await mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await writeFile(path.join(root, file), file.endsWith('.html') ? '<title>x</title><main id="main"><img src="/static/redesign/missing.webp" alt="x"></main>' : 'ok');
    }
    await assert.rejects(() => validateOutput(root), /missing local target/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('validation rejects canonical drift and missing sharing assets', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-seo-'));
  const origin = 'https://example.com';
  try {
    const urls = [];
    for (const file of requiredFiles.filter(file => file.endsWith('.html'))) {
      const canonical = `${origin}/${file === 'index.html' ? '' : file}`;
      const noindex = file === '404.html';
      if (!noindex) urls.push(canonical);
      await mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await writeFile(path.join(root, file), `<title>Portfolio</title><link rel="canonical" href="${canonical}"><meta name="robots" content="${noindex ? 'noindex' : 'index'},follow"><meta property="og:url" content="${canonical}"><meta property="og:title" content="Portfolio"><meta property="og:description" content="Public portfolio"><meta property="og:image" content="${origin}/static/redesign/share.jpg"><main id="main"></main>`);
    }
    await mkdir(path.join(root, 'static/redesign'), { recursive: true });
    await writeFile(path.join(root, 'static/redesign/share.jpg'), 'image fixture');
    await writeFile(path.join(root, 'sitemap.xml'), `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`);
    await writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
    await writeFile(path.join(root, 'llms.txt'), `# Portfolio\n\n> Public portfolio.\n\n## Pages\n- [Home](${origin}/)\n`);
    await validateOutput(root);
    const home = await readFile(path.join(root, 'index.html'), 'utf8');
    await writeFile(path.join(root, 'index.html'), home.replaceAll(`${origin}/"`, `${origin}/index.html"`));
    await assert.rejects(() => validateOutput(root), /Homepage canonical must use \/|Sitemap URLs must match/);
    await writeFile(path.join(root, 'index.html'), home);
    await rm(path.join(root, 'static/redesign/share.jpg'));
    await assert.rejects(() => validateOutput(root), /missing or off-site social image/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
