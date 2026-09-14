import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publish } from './publish.mjs';
import { validateOutput } from './validate-output.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stage = path.join(root, '.site-build');
const run = (command, args, cwd = root) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd, stdio: 'inherit' });
  child.once('error', reject);
  child.once('exit', code => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
});

await run(process.execPath, ['scripts/prepare-assets.mjs']);
await run('npm', ['exec', 'astro', '--', 'build'], path.join(root, 'site'));
const result = await validateOutput(stage);
console.log(`Staging verified: ${result.pages} pages.`);
if (!process.argv.includes('--stage-only')) {
  const published = await publish({ root, stage });
  console.log(`Published ${published.files} generated files (${published.changed} changed).`);
}
