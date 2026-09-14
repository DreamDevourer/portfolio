import rawProjects from './projects.json';
import type { Project } from './types';

function assertProject(value: Project): Project {
  const required = [value.id, value.title, value.description, value.href, value.label, value.image, value.alt];
  if (required.some((entry) => !entry || !entry.trim())) throw new Error(`Invalid project: ${value.id}`);
  if (!value.image.startsWith('static/images/')) throw new Error(`Project image is outside static/images: ${value.image}`);
  if (!value.href.startsWith('/') && !value.href.startsWith('https://')) throw new Error(`Invalid project URL: ${value.href}`);
  return value;
}

export const projects = (rawProjects as Project[]).map(assertProject);
if (new Set(projects.map((project) => project.id)).size !== projects.length) throw new Error('Duplicate project IDs');
