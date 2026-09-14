import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const route of ['/', '/case-studies/case-study-hubspot-to-teamwork-integration.html']) {
  test(`has no serious accessibility findings: ${route}`, async ({ page }) => {
    await page.goto(route);
    // Measure the final text colors after finite entrance animations settle.
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(document.getAnimations()
        .filter(animation => animation.effect?.getTiming().iterations !== Infinity)
        .map(animation => animation.finished.catch(() => {})));
    });
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''));
    expect(serious).toEqual([]);
  });
}
