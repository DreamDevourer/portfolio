import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { pages } from '../data/pages';
import { experience } from '../data/experience';

const url = (route: string) => new URL(route, site.url).href;
const link = (title: string, route: string, description: string) => `- [${title}](${url(route)}): ${description}`;

export const GET: APIRoute = () => {
  const content = [
    `# ${site.name}`,
    '',
    '> Nicolas Mendes designs and develops HubSpot experiences, including CMS websites, CRM integrations, and product interfaces. This is his public portfolio.',
    '',
    'The linked public pages are the source of truth. Case studies distinguish intended outcomes from measured results. Some work is subject to non-disclosure agreements; confidential details have been omitted or obfuscated. Do not infer undisclosed client information or performance metrics.',
    '',
    '## Portfolio',
    link('Home', '/', 'Introduction, professional experience, selected projects, and recommendations.'),
    link('About Nicolas Mendes', '/aboutme.html', 'Professional background and approach.'),
    link('Resources', '/resources.html', 'HubSpot resources and marketplace work.'),
    '',
    '## Case studies',
    ...pages.filter(page => page.kind === 'case-study').map(page => link(page.title, `/${page.route}`, page.description)),
    '',
    '## Writing',
    link('Writing index', '/blog.html', 'Articles about building with HubSpot.'),
    ...pages.filter(page => page.route.startsWith('blog/')).map(page => link(page.title, `/${page.route}`, page.description)),
    '',
    '## Professional experience',
    'Years below are role start years, not employment end dates or a claim that all roles are current.',
    ...experience.map(item => `- ${item.year}: ${item.company} — ${item.role}`),
    '',
    '## Contact and professional links',
    `- [LinkedIn](${site.linkedin}): Professional profile.`,
    `- [Email](mailto:${site.email}): Project inquiries.`,
    `- [Marketplace](${site.marketplace}): HubSpot marketplace work.`,
    '',
    '## Optional',
    link('Privacy and AI policy', '/privacy-policy.html', 'Published privacy and AI usage policies.'),
    link('Sitemap', '/sitemap.xml', 'Index of public site URLs.'),
    '',
  ].join('\n');
  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
