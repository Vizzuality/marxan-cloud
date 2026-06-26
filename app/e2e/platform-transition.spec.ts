import { test, expect } from '@playwright/test';

import { isReportRoute } from '../layout/platform-transition/utils';

const MODAL_TITLE = 'Important Platform Transition Notice';
const COOKIE_NAME = 'platform-transition-2026-maintenance';

async function clearTransitionCookie(context: import('@playwright/test').BrowserContext) {
  const cookies = await context.cookies();
  await context.clearCookies();
  const others = cookies.filter((c) => c.name !== COOKIE_NAME);
  if (others.length) await context.addCookies(others);
}

test.describe('Platform transition modal', () => {
  test.beforeEach(async ({ context }) => {
    await clearTransitionCookie(context);
  });

  test('opens on the landing page when flag is on and no cookie is set', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: MODAL_TITLE })).toBeVisible();
  });

  test('opens on other public routes (proves app-root mount)', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: MODAL_TITLE })).toBeVisible();
  });

  test('dismissing via "Got it" without the checkbox hides the modal but does not set the cookie', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Got it' }).click();
    await expect(page.getByRole('dialog', { name: MODAL_TITLE })).toBeHidden();

    const cookie = (await context.cookies()).find((c) => c.name === COOKIE_NAME);
    expect(cookie).toBeUndefined();
  });

  test('reload after dismissal without the checkbox re-shows the modal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Got it' }).click();
    await expect(page.getByRole('dialog', { name: MODAL_TITLE })).toBeHidden();

    await page.reload();
    await expect(page.getByRole('heading', { name: MODAL_TITLE })).toBeVisible();
  });

  test('checking "Don\'t show me this again" before dismissing sets the cookie and hides on reload', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    await page.getByLabel("Don't show me this again").check();
    await page.getByRole('button', { name: 'Got it' }).click();
    await expect(page.getByRole('dialog', { name: MODAL_TITLE })).toBeHidden();

    const cookie = (await context.cookies()).find((c) => c.name === COOKIE_NAME);
    expect(cookie?.value).toBe('true');

    await page.reload();
    await expect(page.getByRole('dialog', { name: MODAL_TITLE })).toBeHidden({ timeout: 5_000 });
  });

  test('Escape key dismisses without persisting unless the checkbox is checked', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: MODAL_TITLE })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: MODAL_TITLE })).toBeHidden();

    expect((await context.cookies()).find((c) => c.name === COOKIE_NAME)).toBeUndefined();

    await page.reload();
    await expect(page.getByRole('heading', { name: MODAL_TITLE })).toBeVisible();
    await page.getByLabel("Don't show me this again").check();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: MODAL_TITLE })).toBeHidden();

    const cookie = (await context.cookies()).find((c) => c.name === COOKIE_NAME);
    expect(cookie?.value).toBe('true');
  });
});

test.describe('Platform transition modal — route suppression', () => {
  const reportRoutes = [
    '/reports/[pid]/[sid]/blm',
    '/reports/[pid]/[sid]/solutions',
    '/reports/[pid]/[sid]/frequency',
    '/reports/[pid]/[sid]/compare/[sid2]/comparison-map',
  ];

  // The modal must still show while the user navigates the interface, for both
  // registered and anonymous users (anonymous report routes redirect here).
  const interfaceRoutes = [
    '/',
    '/about',
    '/projects',
    '/projects/[pid]',
    '/projects/[pid]/scenarios/[sid]/edit',
    '/community',
    '/admin',
    '/auth/sign-in',
  ];

  for (const route of reportRoutes) {
    test(`suppressed on report route ${route}`, () => {
      expect(isReportRoute(route)).toBe(true);
    });
  }

  for (const route of interfaceRoutes) {
    test(`shown on interface route ${route}`, () => {
      expect(isReportRoute(route)).toBe(false);
    });
  }
});
