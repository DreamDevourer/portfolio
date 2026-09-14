import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
const projects=JSON.parse(await fs.readFile('site/src/data/projects.json','utf8'));
const pages=JSON.parse(await fs.readFile('site/src/data/pages.json','utf8'));
const testimonials=JSON.parse(await fs.readFile('site/src/data/testimonials.json','utf8'));
const sources=new Set([...projects.map(x=>x.image),...pages.map(x=>x.image).filter(Boolean),...testimonials.map(x=>x.image)]);
const legacySources = new Set();
const pageSource = await fs.readFile('site/src/data/pages.ts', 'utf8');
for (const match of pageSource.matchAll(/(?:image|source):\s*['\"]([^'\"]+)/g)) sources.add(match[1]);
for (const file of ['case-study-hubspot-to-teamwork-integration.html', 'case-study-cultura.html']) {
  const legacy = await fs.readFile(path.join('site/legacy', file), 'utf8');
  for (const match of legacy.matchAll(/(?:src|href)=["']\{\{\s*imagesPath\s*\}\}([^"']+)["']/g)) {
    legacySources.add(`static/images/${match[1].trim()}`);
  }
}
for(const file of await fs.readdir('site/src/content')) {
  const text=await fs.readFile(`site/src/content/${file}`,'utf8');
  for(const m of text.matchAll(/!\[[^\]]*\]\(<([^>]+)>\)/g)) sources.add(decodeURI(m[1]).replace(/^\//,''));
}
const target='site/public/static/redesign/media';
// This directory is generated exclusively by this script. Clearing it prevents removed
// content from being copied into the staged site on a later build.
await fs.rm(target,{recursive:true,force:true});
await fs.mkdir(target,{recursive:true});
const media={};
for(const source of [...sources].sort()) {
  if(!source.startsWith('static/images/') || source.includes('..')) throw Error(`Invalid media source: ${source}`);
  const bytes=await fs.readFile(source);const meta=await sharp(bytes).metadata();
  const id=createHash('sha256').update(bytes).update('webp-q82-v1').digest('hex').slice(0,14);
  const widths=[...new Set([480,960,1440,1920].map(w=>Math.min(w,meta.width)))].sort((a,b)=>a-b);
  const variants=[];
  for(const width of widths){const name=`${id}-${width}.webp`;const dest=path.join(target,name);try{await fs.access(dest);}catch{await sharp(bytes).resize({width,withoutEnlargement:true}).webp({quality:82}).toFile(dest);}variants.push({width,src:`/static/redesign/media/${name}`});}
  const socialName = `${id}-social.jpg`;
  await sharp(bytes).resize(1200, 630, { fit: 'contain', background: '#fafcfd' }).flatten({ background: '#fafcfd' }).jpeg({ quality: 88 }).toFile(path.join(target, socialName));
  media[source]={social:`/static/redesign/media/${socialName}`,src:variants.at(-1).src,srcset:variants.map(v=>`${v.src} ${v.width}w`).join(', '),width:meta.width,height:meta.height};
}
await fs.writeFile('site/src/data/media.json',JSON.stringify(media,null,2)+'\n');
const legacyTarget='site/public/static/redesign/legacy';
await fs.rm(legacyTarget,{recursive:true,force:true});
await fs.mkdir(legacyTarget,{recursive:true});
const legacyMedia={};
for (const source of [...legacySources].sort()) {
  if(!source.startsWith('static/images/') || source.includes('..')) throw Error(`Invalid legacy media source: ${source}`);
  const bytes=await fs.readFile(source);
  const id=createHash('sha256').update(bytes).digest('hex').slice(0,14);
  const extension=path.extname(source).toLowerCase();
  const filename=`${id}${extension}`;
  await fs.copyFile(source,path.join(legacyTarget,filename));
  legacyMedia[source]=`/static/redesign/legacy/${filename}`;
}
await fs.writeFile('site/src/data/legacy-media.json',JSON.stringify(legacyMedia,null,2)+'\n');
await fs.mkdir('site/public/static/redesign/licenses',{recursive:true});
for(const font of ['newsreader','geist','geist-mono']) await fs.copyFile(`node_modules/@fontsource-variable/${font}/LICENSE`,`site/public/static/redesign/licenses/${font}.txt`);
await fs.copyFile('static/images/logoDarkCapitalFox.svg', 'site/public/static/redesign/capital-fox.svg');
await fs.copyFile('static/images/637d87780f1d18e6aeac8a90_Rectangle 8994.webp', 'site/public/static/redesign/favicon.webp');
console.log(`Prepared ${sources.size} responsive images, ${legacySources.size} legacy images, and font licenses`);
