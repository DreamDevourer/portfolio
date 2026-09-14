import { promises as fs } from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

export const requiredFiles = [
  'index.html', '404.html', 'aboutme.html', 'blog.html', 'resources.html', 'privacy-policy.html',
  'case-studies/case-study-hubspot-to-teamwork-integration.html',
  'case-studies/case-study-cultura.html',
  'case-studies/case-study-resources-center-hubdb.html',
  'blog/implement-dynamic-news-content-in-hubspot.html',
  'blog/Navigating-the-Shift-Transitioning-Your-Blog-to-HubSpot-CMS.html',
  'blog/hubdb-data-management-in-hubspot.html', 'sitemap.xml', 'robots.txt', 'llms.txt',
];

const ignoredSchemes = /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i;
const isFile = async file => fs.stat(file).then(stat => stat.isFile()).catch(() => false);

function localTarget(from, value) {
  const withoutHash = value.split('#', 1)[0].split('?', 1)[0];
  if (!withoutHash || ignoredSchemes.test(withoutHash) || withoutHash.startsWith('//')) return null;
  return withoutHash.startsWith('/')
    ? withoutHash.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(from), withoutHash));
}

export async function validateOutput(root) {
  const failures = [];
  for (const file of requiredFiles) if (!await isFile(path.join(root, file))) failures.push(`Missing required output: ${file}`);
  if (failures.length) throw Error(failures.join('\n'));

  const htmlFiles = requiredFiles.filter(file => file.endsWith('.html'));
  const sitemap = load(await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8'), { xmlMode: true });
  const sitemapUrls = sitemap('url > loc').toArray().map(node => sitemap(node).text());
  const indexableUrls = [];
  if (!sitemapUrls.length || new Set(sitemapUrls).size !== sitemapUrls.length) failures.push('Sitemap is empty or contains duplicate URLs');
  for (const file of htmlFiles) {
    const html = await fs.readFile(path.join(root, file), 'utf8');
    const $ = load(html);
    if (!$('main#main').length) failures.push(`${file}: missing main landmark`);
    if (!$('title').text().trim()) failures.push(`${file}: missing title`);
    const canonical = $('link[rel="canonical"]').attr('href');
    if (!canonical || !canonical.startsWith('https://')) failures.push(`${file}: missing absolute HTTPS canonical`);
    if (!$('meta[name="robots"]').attr('content')?.includes('noindex') && canonical) indexableUrls.push(canonical);
    if (file === 'index.html' && canonical && new URL(canonical).pathname !== '/') failures.push('Homepage canonical must use /');
    if ($('meta[property="og:url"]').attr('content') !== canonical) failures.push(`${file}: social URL differs from canonical`);
    for (const name of ['og:title', 'og:description', 'og:image']) {
      if (!$(`meta[property="${name}"]`).attr('content')) failures.push(`${file}: missing ${name}`);
    }
    const socialImage = $('meta[property="og:image"]').attr('content');
    if (socialImage) {
      try {
        const imageUrl = new URL(socialImage);
        if (imageUrl.origin !== new URL(canonical).origin || !await isFile(path.join(root, imageUrl.pathname.slice(1)))) failures.push(`${file}: missing or off-site social image`);
      } catch { failures.push(`${file}: invalid social image URL`); }
    }
    for (const node of $('img').toArray()) {
      const alt = $(node).attr('alt');
      if (alt === undefined) failures.push(`${file}: image is missing alt text`);
    }
    for (const node of $('[href], [src]').toArray()) {
      const value = $(node).attr('href') ?? $(node).attr('src');
      if (!value) continue;
      const target = localTarget(file, value);
      if (!target || target.startsWith('../') || target === '..') continue;
      if (!await isFile(path.join(root, target))) failures.push(`${file}: missing local target ${value}`);
    }
  }
  if (sitemapUrls.some(url => !indexableUrls.includes(url)) || indexableUrls.some(url => !sitemapUrls.includes(url))) failures.push('Sitemap URLs must match indexable page canonicals');
  const homeCanonical = indexableUrls.find(url => { try { return new URL(url).pathname === '/'; } catch { return false; } });
  if (homeCanonical) {
    const robots = await fs.readFile(path.join(root, 'robots.txt'), 'utf8');
    if (!robots.includes(`Sitemap: ${new URL('/sitemap.xml', homeCanonical).href}`)) failures.push('robots.txt sitemap URL differs from the canonical site');
    const llms = await fs.readFile(path.join(root, 'llms.txt'), 'utf8');
    if (!llms.startsWith('# ') || !llms.includes('\n> ')) failures.push('llms.txt requires a title and summary');
    for (const [, href] of llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) {
      const target = new URL(href);
      if (target.origin === new URL(homeCanonical).origin && !await isFile(path.join(root, target.pathname === '/' ? 'index.html' : target.pathname.slice(1)))) failures.push(`llms.txt: missing local page ${href}`);
    }
  }
  if (failures.length) throw Error(failures.join('\n'));
  return { files: requiredFiles.length, pages: htmlFiles.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = path.resolve(process.argv[2] ?? '.site-build');
  const result = await validateOutput(root);
  console.log(`Validated ${result.pages} pages and ${result.files} required files in ${root}`);
}
