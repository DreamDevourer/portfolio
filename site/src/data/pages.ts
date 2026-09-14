import type { PageRecord } from './types';

const notice = 'To comply with my non-disclosure agreement with Remotish Agency, I have omitted and obfuscated confidential information in this case study.';

export const pages: PageRecord[] = [
  {
    id: 'teamwork', route: 'case-studies/case-study-hubspot-to-teamwork-integration.html', kind: 'case-study',
    title: 'The Power of HubSpot & Teamwork',
    description: 'A HubSpot-integrated micro-SaaS for creating and tracking Teamwork tasks directly from the CRM.',
    summary: "HubSpot to Teamwork integration, is a dynamic micro-SaaS that seamlessly integrates your HubSpot's portal CRM with your current Teamwork account flow. Our unique platform empowers you to convert your CRM objects - contacts, deals, or companies - into actionable tasks in Teamwork, all directly from the HubSpot panel.",
    image: 'static/images/BG-crm-card.webp', imageAlt: 'Final HubSpot to Teamwork micro-SaaS presentation',
    role: 'UX & Product Designer', scope: '6 weeks', confidentiality: notice, legacyCaseBody: 'teamwork',
    caseIntro: {
      overview: 'Professionals striving to harmonize their sales and project management endeavors need a method to bridge their CRM and task management tools. This ensures they can efficiently turn potential leads into actionable steps. With our HubSpot to Teamwork integration, we offer a dynamic solution that effortlessly merges your HubSpot’s CRM with your Teamwork flow. Experience the power of transforming your CRM objects — be it contacts, deals, or companies — into prioritized tasks in Teamwork, all without leaving the HubSpot interface.',
      question: 'How might we design an app that seamlessly bridges HubSpot CRM with Teamwork, enhancing workflow and user efficiency?',
      process: 'Quick research, interviews, competitive analysis, ideation, prototyping, testing, evaluation',
      tools: 'Figma, Miro, HubSpot CMS, HubSpot CRM, ChatGPT, VSCode, Adobe Photoshop',
    },
    sections: [
      { id: 'overview', title: 'Overview', paragraphs: [
        'Professionals coordinating sales and project work need a reliable way to turn CRM information into work their delivery teams can act on. The project explored a HubSpot–Teamwork connection that makes contacts, deals, and companies useful starting points for tasks and projects.',
        'The central question was: how might an integration bridge HubSpot CRM and Teamwork while improving workflow clarity and efficiency?'
      ], image: 'static/images/CRM-Carousel/03 - Panel PROJECT VIEW (RIGHT SIDE).webp', imageAlt: 'Project view inside the integration', caption: 'A project view designed to surface relevant Teamwork context in HubSpot.' },
      { id: 'research', title: 'Research & discovery', paragraphs: [
        'Research focused on the friction caused by separate CRM and project-management workflows. Users wanted a familiar CRM panel that made key Teamwork information available without manual searching or duplicate task entry.',
        'The discovery work included quick research, interviews, competitive analysis, personas, ideation, prototypes, testing, and evaluation. It identified a need for project counts, open tasks, budgets, overdue work, ownership, and direct actions in the same place people already manage customer records.'
      ], image: 'static/images/Competitive-Audit.webp', imageAlt: 'Competitive audit of integration products', caption: 'Competitive analysis informed the scope and interaction model.' },
      { id: 'solution', title: 'Solution direction', paragraphs: [
        'The resulting concept was a dedicated HubSpot panel for Teamwork associations, task creation, and a compact project overview. The information architecture followed HubSpot patterns so the interface could feel native to CRM users.',
        'The initial proof of concept was built in Node.js with HubSpot and Teamwork APIs. It demonstrated the integration’s feasibility before developers extended it into a fuller Node.js and React application.'
      ], image: 'static/images/00_crm_card_design.jpg', imageAlt: 'Main integration flow between HubSpot and Teamwork', caption: 'The proposed CRM panel and its connection to Teamwork actions.' },
      { id: 'outcomes', title: 'Expected results & reflection', paragraphs: [
        'The project was designed to reduce manual tracking and task creation by making a CRM object the starting point for delivery work. Those were intended outcomes and not newly measured performance claims.',
        'The work reinforced that integrations need to respect the host product’s conventions. Familiar language, predictable panels, and a focused first release mattered more than attempting to automate every workflow at once.'
      ] }
    ]
  },
  {
    id: 'cultura', route: 'case-studies/case-study-cultura.html', kind: 'case-study',
    title: 'Shift To Modern Work Cultures',
    description: 'A HubSpot-connected recruitment platform designed to help companies manage applicants in one place.',
    summary: 'Cultura is an online management platform to help companies and employees align during the recruitment process using HubSpot as its main engine.',
    image: 'static/images/darkHeroFeatured.webp', imageAlt: 'Cultura app dashboard in dark mode',
    role: 'UX & Product Designer, POC Front-end and Back-end developer', scope: 'Approximately 35 weeks for the complete MVP', confidentiality: notice, legacyCaseBody: 'cultura',
    caseIntro: {
      overview: 'Companies delving into the intricacies of recruitment require a unified platform to streamline interactions with potential talent. With Cultura, we introduce a groundbreaking management platform within HubSpot, ensuring companies and applicants find alignment effortlessly, all while managing candidates in one central place.',
      question: 'How might we design a platform that modernizes and consolidates recruitment in HubSpot, ensuring alignment between companies and applicants?',
      process: 'Research, interviews, survey, competitive analysis, ideation, prototyping, testing, evaluation',
      tools: 'Figma, Miro, Adobe Photoshop, Adobe Illustrator, HubSpot CMS, HubSpot CRM, Flask, VSCode',
    },
    sections: [
      { id: 'overview', title: 'Overview', paragraphs: [
        'Cultura explored how a recruitment team could centralize applicant management in HubSpot. The goal was to make the process clearer for hiring managers while respecting the practical constraints of a desktop-first operational product.',
        'The project included research, interviews, surveys, competitive analysis, ideation, prototyping, testing, and evaluation.'
      ], image: 'static/images/Cultura-Carousel/03 - MainApplicantsData.webp', imageAlt: 'Cultura applicants interface', caption: 'Applicant data and recruitment processes in a central interface.' },
      { id: 'strategy', title: 'Strategy & brand', paragraphs: [
        'Early research established a people-first, accurate, friendly, layered, all-in-one product direction. The visual identity and product structure were developed together so the platform could remain understandable as the workflow grew.',
        'Brand positioning, moodboards, logo studies, and design-system decisions turned the strategy into an operational interface language.'
      ], image: 'static/images/LogoConcept.webp', imageAlt: 'Cultura logomark and wordmark concept', caption: 'Brand exploration connected to the product’s layered workflow model.' },
      { id: 'product', title: 'Product design', paragraphs: [
        'The application organized job forms, listings, applicants, onboarding, communication, and dashboards around familiar recruitment work. The experience aimed to automate routine steps when confidence was high and make the next action explicit when it was not.',
        'The interface used established patterns to support a mostly desktop audience that needed a clear, conventional operational workspace.'
      ], image: 'static/images/ATS-Hub-prototype2.webp', imageAlt: 'ATS Hub prototype', caption: 'An early prototype for centralizing recruitment operations.' },
      { id: 'reflection', title: 'Reflection', paragraphs: [
        'Cultura connected product strategy, brand, UI, and HubSpot implementation in a single long-running program. The legacy case study describes results and future work as source-era statements; this redesign does not restate them as independently verified metrics.',
        'The adjacent HubSpot theme was later generalized into a separate marketplace project while retaining the product-system lessons from Cultura.'
      ] }
    ]
  },
  {
    id: 'hubdb-resource-center', route: 'case-studies/case-study-resources-center-hubdb.html', kind: 'case-study',
    title: 'A HubDB Resource Center', description: 'A resource-library engine built for FinThrive with HubSpot CMS and HubDB.',
    summary: 'A focused HubSpot CMS resource center for FinThrive, backed by HubDB for structured, maintainable content.',
    image: 'static/images/hubdbHowTo.webp', imageAlt: 'HubDB resource center interface', role: 'Full-stack HubSpot CMS Developer', scope: '2 weeks', confidentiality: notice,
    caseIntro: {
      overview: 'FinThrive needed a resource-library engine powered by HubSpot HubDB and CMS Hub. The work paired a reusable presentation layer with a structured content model for an easier-to-maintain collection.',
      question: 'How might a resource library stay easy to update as its content collection grows?',
      process: 'HubSpot theme development, design and development collaboration, HubDB architecture',
      tools: 'HubSpot CMS, HubDB, Figma, VSCode',
    },
    sections: [
      { id: 'overview', title: 'Overview', paragraphs: [
        'This engagement delivered a resource-library engine for FinThrive using HubSpot CMS and HubDB. It focused on making a structured content collection easier to maintain and browse.',
        'The available case-study source supports theme development, design and development collaboration, and HubDB architecture. It does not support the unrelated HubSpot-to-Teamwork narrative that appeared in the legacy page.'
      ] },
      { id: 'approach', title: 'Approach', paragraphs: [
        'The work combined a reusable CMS presentation layer with a HubDB-backed content model. This separated editorial data from page structure and provided a maintainable route for expanding the library.',
        'Confidential details have been omitted in line with the original portfolio’s policy.'
      ] }
    ]
  },
  {
    id: 'about', route: 'aboutme.html', kind: 'page', title: 'Who I am.', description: 'About Nicolas Mendes.',
    summary: 'A multidisciplinary product designer and HubSpot developer working across web design, front-end development, research, and product systems.',
    image: 'static/images/Gallery-simple.webp', imageAlt: 'Portrait of Nicolas Mendes',
    sections: [
      { id: 'practice', title: 'Practice', paragraphs: [
        'I am Nicolas Mendes, a multidisciplinary product designer and developer. My work spans web design, front-end development, UI/UX research, and product applications.',
        'I have worked remotely with teams and clients in the United States, Germany, Mexico, and Brazil. I value thoughtful collaboration, clear systems, and the work of turning complex requirements into something people can use.'
      ], image: 'static/images/MAP.webp', imageAlt: 'Map of locations where Nicolas Mendes has worked', caption: 'A distributed practice shaped by international collaboration.' },
      { id: 'experience', title: 'Experience', paragraphs: [
        'My portfolio includes work for Remotish Agency, Maker Mockup, HubSpot CMS projects, and marketplace themes. I bring design education, inbound marketing knowledge, front-end practice, and Agile coursework into the same process.',
        'If you need a website, design system, app prototype, or a more durable HubSpot implementation, I am available to discuss the problem.'
      ] }
    ]
  },
  {
    id: 'privacy', route: 'privacy-policy.html', kind: 'page', title: 'Privacy & AI Policy', description: 'Privacy and AI usage policy for Nicolas Mendes projects.',
    summary: 'This privacy policy applies to any HubSpot Application and HubSpot Marketplace Theme made by me.',
    legacyPrivacyBody: true,
    sections: [
      { id: 'summary', title: 'Summary', paragraphs: [
        'Nicolas Mendes operates nickdesign.netlify.app, capital-fox.com, and related project pages. This policy explains the collection, use, and disclosure of personal information when visitors use those services.',
        'Information collected for services is used to provide and improve them and is not shared except as described in this policy.'
      ] },
      { id: 'information', title: 'Information collection & use', paragraphs: [
        'For a better experience, services may request personally identifiable information such as a name, phone number, or postal address. The information is used to contact or identify the person who provides it.',
        'Browser log data may include IP address, browser version, visited pages, visit time, and related statistics. Cookies may be used to improve services, and visitors can choose whether to accept them in their browser.'
      ] },
      { id: 'providers', title: 'Service providers & external links', paragraphs: [
        'Third-party companies or individuals may facilitate services, provide a service on behalf of Nicolas Mendes, or help analyze service use. They are expected not to disclose or use personal information for other purposes.',
        'External links lead to services operated by others. Visitors should review those providers’ privacy policies because Nicolas Mendes does not control their practices.'
      ] },
      { id: 'ai', title: 'AI usage policy', paragraphs: [
        'AI tools may assist internal workflows and content development, but human review, transparency, privacy, and accountability remain required. AI does not replace human judgment in client work.',
        'The policy prohibits undisclosed automated content, privacy violations, manipulative UX, deepfakes or marketing misrepresentation, unethical SEO, non-consensual personalization, misleading chatbots, automated client decisions, fake reviews, and copycat designs.'
      ] }
    ]
  },
  {
    id: 'dynamic-content', route: 'blog/implement-dynamic-news-content-in-hubspot.html', kind: 'article', title: 'Creating Dynamic Content in HubSpot: A Comprehensive Guide', description: 'A guide to building dynamic content in HubSpot.', date: 'December 8, 2023',
    summary: 'A practical introduction to building dynamic content in HubSpot CMS through a news-page example.', image: 'static/images/dynamicContent.jpg', imageAlt: 'Person using a computer',
    sections: [
      { id: 'intro', title: 'Start with a useful content model', paragraphs: [
        'Dynamic content can make a website more useful by presenting information that changes with context. HubSpot CMS combines templates, CRM data, and structured content tools that make those experiences possible.',
        'A news page is a compact example: it needs a reliable source of entries, a clear template, and a presentation that remains understandable when the data changes.'
      ] },
      { id: 'hubdb', title: 'Use HubDB for structured content', paragraphs: [
        'HubDB can store rows such as title, summary, author, publish date, image, category, and destination URL. Templates can then query those fields instead of requiring an editor to rebuild a page for every update.',
        'Treat the table as a content contract. Give fields predictable names, validate links and images, and decide which data is required before the template renders it.'
      ] },
      { id: 'templates', title: 'Design for change', paragraphs: [
        'A resilient dynamic template should handle a missing image, an empty category, a long title, and a growing list of entries. Keep the visual hierarchy stable so newer content does not require a new layout.',
        'This approach makes editorial updates faster while keeping the website’s code and presentation consistent.'
      ] }
    ]
  },
  {
    id: 'blog-transition', route: 'blog/Navigating-the-Shift-Transitioning-Your-Blog-to-HubSpot-CMS.html', kind: 'article', title: 'Navigating the Shift: Transitioning Your Blog to HubSpot CMS', description: 'A practical guide to moving a blog into HubSpot CMS.', date: 'December 4, 2023',
    summary: 'A guide to planning a blog migration into HubSpot CMS without losing structure, content, or discoverability.',
    sections: [
      { id: 'plan', title: 'Plan the migration', paragraphs: [
        'A blog migration is a content and information-architecture project before it is a template project. Inventory articles, authors, categories, featured media, metadata, and existing URLs before choosing a new theme.',
        'Map old URLs to their future destinations early. Search visibility and existing readers depend on predictable paths and redirects.'
      ] },
      { id: 'build', title: 'Build reusable templates', paragraphs: [
        'Use one article template, one listing template, and shared partials for author information, related content, navigation, and calls to action. Let structured fields drive the differences between posts.',
        'Review content at realistic lengths. Short test copy rarely reveals the typography and spacing failures a real article will create.'
      ] },
      { id: 'launch', title: 'Validate before launch', paragraphs: [
        'Check metadata, canonical URLs, images, internal links, subscriptions, analytics, and redirects in a staging environment. A controlled launch is easier to correct than a rushed migration with unknown URL changes.',
        'After launch, review crawl errors and reader behavior to find content that needs cleanup or a clearer navigation path.'
      ] }
    ]
  },
  {
    id: 'hubdb-management', route: 'blog/hubdb-data-management-in-hubspot.html', kind: 'article', title: 'HubDB: Revolutionizing Data Management in HubSpot CMS', description: 'A guide to HubDB data management in HubSpot CMS.', date: 'November 28, 2023',
    summary: 'A practical overview of using HubDB to manage structured, repeatable data in HubSpot CMS.',
    sections: [
      { id: 'why', title: 'Why HubDB', paragraphs: [
        'HubDB gives HubSpot CMS projects a structured place for repeated content. Instead of duplicating markup for every location, product, team member, or resource, authors can maintain rows and let templates render them.',
        'The value is consistency: a single update can feed multiple pages without breaking the underlying design system.'
      ] },
      { id: 'model', title: 'Model data intentionally', paragraphs: [
        'Start with the questions each template needs to answer. Define clear columns for titles, descriptions, images, links, categories, and ordering. Avoid combining unrelated values into a single text field.',
        'Give every row an editorial owner and test how the template behaves when fields are omitted or content gets longer than expected.'
      ] },
      { id: 'scale', title: 'Scale without losing control', paragraphs: [
        'As a collection grows, add filtering, pagination, and predictable URLs instead of adding one-off templates. Keep logic close to the data model and visual decisions close to the component that presents them.',
        'That separation makes a content collection easier to maintain for developers and editors alike.'
      ] }
    ]
  }
];

export const pageById = (id: string) => {
  const page = pages.find((candidate) => candidate.id === id);
  if (!page) throw new Error(`Unknown page: ${id}`);
  return page;
};

export const articlePages = pages.filter((page) => page.kind === 'article');
export const caseStudyPages = pages.filter((page) => page.kind === 'case-study');
