import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateOutput } from './validate-output.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = await validateOutput(root);
console.log(`Root output verified: ${result.pages} pages.`);
