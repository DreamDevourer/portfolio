import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type LegacyContentSource = 'teamwork' | 'cultura' | 'privacy';

export interface LegacyHeading {
  id: string;
  title: string;
}

const caseFiles = {
  teamwork: 'case-study-hubspot-to-teamwork-integration.html',
  cultura: 'case-study-cultura.html',
} as const;

const textFromHtml = (value: string) => value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const slug = (value: string) => textFromHtml(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function getLegacyBody(source: LegacyContentSource) {
  if (source === 'privacy') {
    const template = await readFile(path.resolve(process.cwd(), 'legacy', 'privacy-policy.html'), 'utf8');
    const match = template.match(/<div class="text--zone">([\s\S]*?)<\/div>\s*<\/section>/);
    if (!match) throw new Error('Could not extract the legacy privacy-policy body.');
    return match[1]
      .replace(/<h1[\s\S]*?<\/h1>/, '')
      .replace(/<p class="readable--area quote-p-std">[\s\S]*?<\/p>/, '');
  }
  const template = await readFile(path.resolve(process.cwd(), 'legacy', caseFiles[source]), 'utf8');
  const match = template.match(/<section class="case--area">([\s\S]*?)<\/section>\s*\{# Carousel #}/);
  if (!match) throw new Error(`Could not extract the legacy ${source} case-study body.`);
  return match[1]
    .replace(/\{#[\s\S]*?#\}/g, '')
    .replace(/\{%.+?%\}/g, '')
    .replace(/\{\{\s*imagesPath\s*\}\}/g, '/static/images/')
    .replace(/<button[\s\S]*?<\/button>/g, '')
    .replace(/\s*\{\{\s*caseStudy\.html\s*\|\s*safe\s*\}\}\s*<\/section>\s*#\}/g, '')
    .replace(/\{\{[\s\S]*?\}\}\s*#\}/g, '');
}

export function identifyLegacyHeadings(body: string) {
  const headings: LegacyHeading[] = [];
  const used = new Map<string, number>();
  const html = body.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_whole, level, attributes, content) => {
    const base = slug(content) || 'section';
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;
    headings.push({ id, title: textFromHtml(content) });
    return `<h${level}${attributes} id="${id}" data-content-heading>${content}</h${level}>`;
  });
  return { html, headings };
}
