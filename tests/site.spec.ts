import { expect, test } from '@playwright/test';
import { experience } from '../site/src/data/experience';

test('homepage exposes the work gallery and usable navigation at each target width', async ({ page }) => {
  for (const width of [390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('HubSpot');
    await expect(page.locator('.project-card')).toHaveCount(4);
    await expect(page.locator('.site-nav a')).toHaveCount(3);
    if (width >= 768) await expect(page.locator('.site-nav a', { hasText: 'Work' })).toBeVisible();
    await expect(page.locator('.site-nav a', { hasText: 'Marketplace' })).toHaveAttribute('href', 'https://marketplace.capital-fox.com/');
    expect(await page.locator('body').evaluate(body => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('header becomes a dock after scrolling and resets at the top', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('.site-header');
  await expect(header).toHaveAttribute('data-docked', 'false');
  await page.evaluate(() => window.scrollTo(0, 120));
  await expect(header).toHaveAttribute('data-docked', 'true');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toHaveAttribute('data-docked', 'false');
});

test('mobile navigation keeps its trigger in the header and closes predictably', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const nav = page.locator('.site-nav');
  const toggle = page.locator('.nav-toggle');
  await expect(nav).not.toHaveAttribute('open', '');
  await expect(toggle).toBeVisible();
  await expect(toggle.locator('span')).toHaveCount(3);
  await toggle.click();
  await expect(nav).toHaveAttribute('open', '');
  await expect(page.locator('.site-nav a', { hasText: 'Work' })).toBeVisible();
  await expect(page.locator('.site-nav a', { hasText: 'LinkedIn' })).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(nav).not.toHaveAttribute('open', '');
  await toggle.click();
  await page.mouse.click(10, 400);
  await expect(nav).not.toHaveAttribute('open', '');
});

test('testimonials retain their profile details and rotate without visible controls', async ({ page }) => {
  await page.addInitScript(() => {
    const setInterval = window.setInterval;
    window.setInterval = (handler, delay, ...args) => setInterval(handler, delay === 8000 ? 10 : delay, ...args);
  });
  await page.goto('/');
  const section = page.locator('[data-testimonial-carousel]');
  await expect(section.getByRole('heading', { name: 'Recommendations', exact: true })).toBeVisible();
  await expect(section).toContainText('Avery Pilot');
  await expect(section).toContainText('Pipl');
  await expect(section.locator('button')).toHaveCount(0);
  await expect(section.locator('[data-testimonial-slide]')).toHaveCount(2);
  await expect(section.getByText('Leandro Morabito')).toBeVisible({ timeout: 1000 });
});

test('case study preserves legacy body copy and editorial intro', async ({ page }) => {
  await page.goto('/case-studies/case-study-hubspot-to-teamwork-integration.html');
  await expect(page.locator('.case-intro h1')).toContainText('The Power of HubSpot & Teamwork');
  await expect(page.locator('.case-intro__meta')).toContainText('UX & Product Designer');
  await expect(page.getByRole('heading', { name: 'Streamlining Services Interface' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Research & Discovery' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Expected Results' })).toHaveAttribute('href', '#expected-results');
  await page.getByRole('link', { name: 'Expected Results' }).click();
  await expect(page).toHaveURL(/#expected-results$/);
});

test('long case-study contents stay below the docked header and remain scrollable', async ({ page }) => {
  for (const width of [768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 650 });
    await page.goto('/case-studies/case-study-cultura.html');
    await page.locator('.article-layout').evaluate(element => {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + 500, behavior: 'instant' });
    });
    await expect(page.locator('.site-header')).toHaveAttribute('data-docked', 'true');
    const geometry = await page.evaluate(() => {
      const header = document.querySelector('.site-header__inner')!.getBoundingClientRect();
      const contents = document.querySelector('.article-nav')!;
      const nav = contents.getBoundingClientRect();
      return { headerBottom: header.bottom, navTop: nav.top, navBottom: nav.bottom, navHeight: contents.clientHeight, scrollHeight: contents.scrollHeight };
    });
    expect(geometry.navTop).toBeGreaterThan(geometry.headerBottom);
    expect(geometry.navBottom).toBeLessThanOrEqual(650);
    expect(geometry.scrollHeight).toBeGreaterThan(geometry.navHeight);
    await page.locator('.article-nav').evaluate(element => { element.scrollTop = element.scrollHeight; });
    await expect(page.locator('.article-nav a').last()).toBeInViewport();
  }
});

test('case-study galleries loop slowly, pause on hover, and retain manual scrolling', async ({ page }) => {
  for (const [route, screens] of [
    ['/case-studies/case-study-hubspot-to-teamwork-integration.html', 5],
    ['/case-studies/case-study-cultura.html', 5],
    ['/case-studies/case-study-resources-center-hubdb.html', 4],
  ]) {
    await page.goto(route);
    const gallery = page.locator('[data-case-gallery]');
    const track = gallery.locator('[data-gallery-track]');
    await gallery.scrollIntoViewIfNeeded();
    await expect(gallery.getByRole('heading', { name: 'Inside the work' })).toHaveCount(0);
    await expect(gallery.locator('button')).toHaveCount(0);
    await expect(gallery.locator('figcaption')).toHaveCount(0);
    await expect(track.locator('[data-gallery-slide]:not([data-gallery-clone]) img')).toHaveCount(screens);
    const position = () => track.evaluate(element => element.scrollLeft);
    const start = await position();
    await expect.poll(position).toBeGreaterThan(start + 3);
    await track.hover();
    const paused = await position();
    await page.waitForTimeout(300);
    expect(await position()).toBe(paused);
    await page.mouse.wheel(120, 0);
    await expect.poll(() => track.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
    await track.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await gallery.evaluate(element => element.dispatchEvent(new PointerEvent('pointerleave')));
    const resume = await position();
    await expect.poll(async () => Math.abs(await position() - resume)).toBeGreaterThan(3);
  }
});

test('privacy anchors and floating back-to-top control follow scrolling', async ({ page }) => {
  await page.goto('/privacy-policy.html');
  await expect(page.getByRole('link', { name: 'AI USAGE POLICY' })).toHaveAttribute('href', '#ai-usage-policy');
  await expect(page.locator('[data-back-to-top]')).toHaveAttribute('data-visible', 'false');
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(page.locator('[data-back-to-top]')).toHaveAttribute('data-visible', 'true');
  await page.locator('[data-back-to-top]').click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('email action supplies visible feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.locator('[data-copy-email]').first().click();
  await expect(page.locator('[data-email-status]').first()).toContainText(/Email copied|Opening your email app/);
  const footerEmail = page.locator('.site-footer [data-copy-email]');
  await page.evaluate(() => navigator.clipboard.writeText(''));
  await footerEmail.click();
  await expect(page.locator('.site-footer [data-email-status]')).toHaveText('Email copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await footerEmail.getAttribute('data-copy-email'));
});

test('custom cursor recovers after enlarging a project image', async ({ page }) => {
  await page.goto('/case-studies/case-study-hubspot-to-teamwork-integration.html');
  const image = page.locator('[data-enlarge]').first();
  await image.hover();
  await expect(page.locator('[data-cursor-label]')).toHaveAttribute('data-mode', 'action');
  await expect(page.locator('[data-cursor-text]')).toHaveText('image');
  await image.click();
  await expect(page.locator('[data-image-dialog]')).toBeVisible();
  await page.locator('[data-dialog-close]').click();
  await page.mouse.move(40, 40);
  await expect(page.locator('[data-cursor-label]')).toHaveAttribute('data-visible', 'true');
});

test('reduced motion removes decorative animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.cursor-label')).toBeHidden();
});

test('experience loops, pauses on hover, allows wheel scrolling, and resumes', async ({ page }) => {
  await page.goto('/');
  const viewport = page.locator('[data-experience-viewport]');
  const position = () => viewport.evaluate(el => el.scrollTop);
  await page.evaluate(() => document.fonts.ready);
  await viewport.hover();
  const cycleHeight = await page.locator('[data-experience-list]').evaluate(el => el.offsetHeight);
  await viewport.evaluate((el, height) => { el.scrollTop = height; }, cycleHeight);
  await page.mouse.move(0, 0);
  const initial = await position();
  await expect.poll(position).toBeGreaterThan(initial + 3);
  await viewport.hover();
  const stopped = await position();
  await page.waitForTimeout(300);
  expect(await position()).toBe(stopped);
  await page.mouse.wheel(0, 120);
  await expect.poll(position).toBeGreaterThan(stopped + 50);
  await page.mouse.move(0, 0);
  const resumed = await position();
  await expect.poll(position).toBeGreaterThan(resumed + 3);
  await viewport.focus();
  const focused = await position();
  await page.waitForTimeout(300);
  expect(await position()).toBe(focused);
  await page.keyboard.press('ArrowDown');
  await expect.poll(position).toBeGreaterThan(focused);
  await page.locator('h1').click();
  await page.mouse.move(0, 0);
  // Approach the seam and verify the loop returns to its middle copy.
  const height = await page.locator('[data-experience-list]').evaluate(el => el.offsetHeight);
  await viewport.hover();
  await viewport.evaluate((el, height) => { el.scrollTop = height * 2 - 2; }, height);
  await page.mouse.move(0, 0);
  await expect.poll(position).toBeLessThan(height + 30);
});

test('experience stays readable at all target widths and with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const viewport = page.locator('[data-experience-viewport]');
    await expect(viewport.locator('li')).toHaveCount(experience.length);
    await expect(page.locator('[data-experience] button')).toHaveCount(0);
    await page.waitForTimeout(200);
    expect(await viewport.evaluate(el => el.scrollTop)).toBe(0);
    expect(await viewport.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    if (width >= 1024) {
      const heading = await page.locator('h1').boundingBox();
      const scroller = await viewport.boundingBox();
      const card = await page.locator('.project-card').nth(1).boundingBox();
      expect(Math.abs(scroller!.x - card!.x)).toBeLessThan(1);
      expect(Math.abs(scroller!.y - heading!.y)).toBeLessThan(1);
      expect(Math.abs(scroller!.height - heading!.height)).toBeLessThan(1);
    }
    await page.screenshot({ path: `/tmp/portfolio-experience/hero-${width}.png` });
    await viewport.focus();
    await page.keyboard.press('End');
    await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  }
});

test('experience is accessible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  const viewport = page.getByRole('region', { name: /Professional experience/ });
  await expect(viewport.getByRole('listitem')).toHaveCount(experience.length);
  await viewport.focus();
  await page.keyboard.press('End');
  await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await context.close();
});
