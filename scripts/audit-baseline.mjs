import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { browserOptions } from './browser-options.mjs';
const browser = await chromium.launch(browserOptions());
await mkdir('docs/design/baseline', { recursive: true });
const results = [];
for (const [name,url] of [
  ['current-home','http://127.0.0.1:8000/'],
  ['current-teamwork','http://127.0.0.1:8000/case-studies/case-study-hubspot-to-teamwork-integration.html'],
  ['reference-home','https://www.rachelchen.tech/'],
  ['reference-case','https://www.rachelchen.tech/projects/openai'],
]) {
  for (const width of [390,768,1440,1920]) {
    const page = await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    try {
      await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({path:`docs/design/baseline/${name}-${width}.png`});
      results.push({name,width,url,title:await page.title(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),links:await page.locator('a').count()});
      if (width===1440 && name.startsWith('reference')) {
        const cards=page.locator('[data-cursor="case-study"]');
        if(await cards.count()){await cards.first().hover(); await page.screenshot({path:`docs/design/baseline/${name}-hover.png`});}
        results.push({name,interactionEvidence:await page.evaluate(()=>({cursorLabels:[...document.querySelectorAll('[data-cursor]')].map(x=>x.getAttribute('data-cursor')),videos:[...document.querySelectorAll('video')].map(x=>({paused:x.paused,muted:x.muted,loop:x.loop})),sectionLinks:[...document.querySelectorAll('aside button, aside a')].map(x=>x.textContent)}))});
      }
    } catch(e) {results.push({name,width,error:e.message});}
    await page.close();
  }
}
await writeFile('docs/design/baseline/results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results));
await browser.close();
