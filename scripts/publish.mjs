import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
export const hash = data => createHash('sha256').update(data).digest('hex');
const manifestName = '.portfolio-output.json';
const allowed = name => /^(index|aboutme|blog|resources|privacy-policy|404)\.html$/.test(name) || /^(case-studies|blog)\/[A-Za-z0-9_-]+\.html$/.test(name) || /^(sitemap\.xml|robots\.txt|llms\.txt)$/.test(name) || /^static\/redesign\/[A-Za-z0-9_./-]+$/.test(name);
export function safeName(name) {
  if (typeof name !== 'string' || name.includes('\\') || path.posix.isAbsolute(name) || name.split('/').some(x => !x || x === '.' || x === '..') || !allowed(name)) throw Error(`Unsafe output path: ${name}`);
  return name;
}
async function assertNoSymlink(root, name) {
  let cursor = root;
  for (const part of ['', ...name.split('/')]) {
    if(part) cursor = path.join(cursor, part);
    try { const st = await fs.lstat(cursor); if(st.isSymbolicLink()) throw Error(`Symlink rejected: ${cursor}`); }
    catch(e) { if(e.code !== 'ENOENT') throw e; }
  }
}
async function walk(root, dir='') {
  const output=[];
  for(const entry of await fs.readdir(path.join(root,dir),{withFileTypes:true})) {
    const name=path.posix.join(dir,entry.name);
    if(entry.isSymbolicLink()) throw Error(`Symlink in staging: ${name}`);
    if(entry.isDirectory()) output.push(...await walk(root,name));
    else if(entry.isFile()) output.push(safeName(name));
    else throw Error(`Unsupported output: ${name}`);
  }
  return output.sort();
}
export async function publish({root,stage,failAfter=Infinity}) {
  root=path.resolve(root);stage=path.resolve(stage);
  if(stage===root) throw Error('Staging cannot be the repository root');
  await assertNoSymlink(stage,'');
  await assertNoSymlink(root,manifestName);
  const manifestFile=path.join(root,manifestName);
  const oldBytes=await fs.readFile(manifestFile);
  const old=JSON.parse(oldBytes);
  if(old.version!==1 || !old.files || typeof old.files!=='object') throw Error('Invalid output manifest');
  const names=await walk(stage);
  if(!names.includes('index.html') || !names.includes('404.html')) throw Error('Incomplete staged site');
  const changes=new Map();const originals=new Map();const next={version:1,files:{}};
  for(const name of new Set([...Object.keys(old.files),...names])) {
    safeName(name);await assertNoSymlink(root,name);
    const destination=path.join(root,name);
    let bytes=null;
    try{bytes=await fs.readFile(destination);}catch(e){if(e.code!=='ENOENT') throw e;}
    if(bytes && !Object.hasOwn(old.files,name)) throw Error(`Unowned output collision: ${name}`);
    if(bytes && hash(bytes)!==old.files[name]) throw Error(`Locally changed output: ${name}; preserve/reconcile it before publishing`);
    originals.set(name,bytes);
    if(names.includes(name)) {const data=await fs.readFile(path.join(stage,name));next.files[name]=hash(data);if(!bytes || hash(bytes)!==hash(data)) changes.set(name,data);}
    else if(bytes) changes.set(name,null);
  }
  const written=[];
  async function atomic(file,data) {
    await fs.mkdir(path.dirname(file),{recursive:true});
    const temp=path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.portfolio-tmp`);
    await fs.writeFile(temp,data,{flag:'wx'});
    try{await fs.rename(temp,file);}finally{await fs.rm(temp,{force:true});}
  }
  try {
    for(const [name,data] of changes) {
      if(written.length>=failAfter) throw Error('Simulated write failure');
      await assertNoSymlink(root,name);
      if(data===null) await fs.unlink(path.join(root,name));else await atomic(path.join(root,name),data);
      written.push(name);
    }
    await atomic(manifestFile,JSON.stringify(next,null,2)+'\n');
  } catch(e) {
    for(const name of written.reverse()) {
      const bytes=originals.get(name);if(bytes===null) await fs.rm(path.join(root,name),{force:true});else await atomic(path.join(root,name),bytes);
    }
    throw e;
  }
  return {files:names.length,changed:changes.size};
}
