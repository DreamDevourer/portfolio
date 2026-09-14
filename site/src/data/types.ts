export type ProjectKind = 'case-study' | 'external';

export interface Project {
  id: string;
  title: string;
  description: string;
  href: string;
  kind: ProjectKind;
  label: string;
  image: string;
  alt: string;
  objectPosition?: string;
}

export interface ArticleSection {
  id: string;
  title: string;
  paragraphs: string[];
  image?: string;
  imageAlt?: string;
  caption?: string;
}

export interface CaseStudyIntro {
  overview: string;
  question: string;
  process: string;
  tools: string;
}

export interface CaseStudyGalleryItem {
  source: string;
  alt: string;
}

export interface PageRecord {
  id: string;
  route: string;
  kind: 'case-study' | 'article' | 'page';
  title: string;
  description: string;
  summary?: string;
  image?: string;
  imageAlt?: string;
  role?: string;
  scope?: string;
  date?: string;
  confidentiality?: string;
  caseIntro?: CaseStudyIntro;
  gallery?: CaseStudyGalleryItem[];
  legacyCaseBody?: 'teamwork' | 'cultura';
  legacyPrivacyBody?: boolean;
  sections: ArticleSection[];
}

export interface PreparedMedia {
  src: string;
  srcset: string;
  width: number;
  height: number;
}
