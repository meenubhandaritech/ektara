import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/understand',
  '/journey',
  '/navigator',
  '/resources',
  '/directory',
  '/assistant',
  '/privacy',
  '/login',
  '/register',
  '/forgot-password',
  '/onboarding',
  '/dashboard',
  '/admin',
];

test('all application routes render or redirect to a safe screen', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('main h1').first()).not.toBeEmpty();
  }
});

test('production auth screens expose Google and validated email registration', async ({ page }) => {
  await page.route('http://localhost:8180/api/status', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ demoMode: false, auth: 'firebase', assistant: 'faq-fallback', environment: 'test' }),
    }),
  );

  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();

  await page.goto('/register');
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  await expect(page.getByLabel('Your name')).toBeVisible();
  await expect(page.getByLabel('Confirm password')).toBeVisible();
});

test('homepage and mobile navigation fit supported viewport widths', async ({ page }) => {
  for (const width of [1440, 1280, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);

    if (width < 1024) {
      const menu = page.getByRole('button', { name: 'Menu' });
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
    }
  }
});

test('resource search filters verified-state cards and can be cleared', async ({ page }) => {
  await page.goto('/resources');
  await page.getByLabel('Search').fill('CARA');
  await expect(page.getByRole('heading', { name: 'CARA — Information for Prospective Adoptive Parents' })).toBeVisible();
  await expect(page.getByText('Pending verification').first()).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByLabel('Search')).toHaveValue('');
});

test('navigator shows answers, allows edits, and can restart', async ({ page }) => {
  await page.goto('/navigator');
  for (const label of ['In India', 'Resident Indian', 'An unrelated child', 'The general process', 'No']) {
    await page.getByRole('button', { name: new RegExp(label) }).click();
  }
  await expect(page.getByText('Preliminary informational guidance — not an official eligibility determination or legal opinion.').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your answers' })).toBeVisible();
  await page.getByRole('button', { name: 'Change' }).nth(2).click();
  await page.getByRole('button', { name: /A relative’s child/ }).click();
  await page.getByRole('button', { name: /The general process/ }).click();
  await page.getByRole('button', { name: /^No/ }).click();
  await expect(page.getByRole('heading', { name: /Adoption of a relative’s child/ })).toBeVisible();
  await expect(page.getByText('A relative’s child', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start again' }).click();
  await expect(page.getByText('Question 1 of 5')).toBeVisible();
});

test('assistant displays source metadata and transparent demo verification status', async ({ page }) => {
  await page.goto('/assistant');
  await page.getByRole('button', { name: 'How do I begin adoption in India?' }).click();
  await expect(page.getByRole('log')).toContainText('Sources');
  await expect(page.getByRole('log')).toContainText('Ministry of Women and Child Development');
  await expect(page.getByRole('log')).toContainText('not independently verified');
  await expect(page.getByRole('log')).toContainText('Needs confirmation');
});

test('demo user can save a route and manage personal preparation records', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Continue as demo user' }).click();
  await page.waitForURL(/\/onboarding$/);
  await page.getByLabel('What should we call you?').fill('Playwright Demo User');
  await page.getByRole('button', { name: 'Continue to your next step' }).click();
  await page.waitForURL(/\/navigator$/);

  await page.goto('/navigator');
  for (const label of ['In India', 'Resident Indian', 'An unrelated child', 'The general process', 'No']) {
    await page.getByRole('button', { name: new RegExp(label) }).click();
  }
  await page.getByRole('button', { name: 'Save to my dashboard' }).click();
  await expect(page.getByText(/^Saved\./)).toBeVisible();

  await page.goto('/dashboard');
  await page.getByRole('tab', { name: 'Checklist' }).click();
  const checklistToggle = page.locator('button[aria-label^="Mark "]').first();
  await expect(checklistToggle).toBeVisible();
  await checklistToggle.click();
  await expect(checklistToggle).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('tab', { name: 'Reminders' }).click();
  await page.getByLabel('Title').fill('Playwright reminder');
  await page.getByLabel('Date').fill('2027-01-03');
  await page.getByRole('button', { name: 'Add reminder' }).click();
  const reminder = page.locator('li').filter({ hasText: 'Playwright reminder' });
  await expect(reminder).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await reminder.getByRole('button', { name: 'Delete Playwright reminder' }).click();
  await expect(reminder).toHaveCount(0);

  await page.getByRole('tab', { name: 'Saved & notes' }).click();
  await page.getByLabel('New note').fill('Temporary Playwright note');
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(page.getByText('Temporary Playwright note')).toBeVisible();
  await page.getByRole('button', { name: 'Edit note' }).click();
  await page.getByRole('textbox', { name: 'Edit note' }).fill('Updated Playwright note');
  await page.getByRole('button', { name: 'Save note' }).click();
  await expect(page.getByText('Updated Playwright note')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete note' }).click();
  await expect(page.getByText('Updated Playwright note')).toHaveCount(0);
});

test('demo administrator can manage public content without private user-data panels', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Continue as demo admin' }).click();
  await page.waitForURL(/\/onboarding$/);
  await page.getByLabel('What should we call you?').fill('Playwright Demo Admin');
  await page.getByRole('button', { name: 'Continue to your next step' }).click();
  await page.waitForURL(/\/navigator$/);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Content administration' })).toBeVisible();
  await expect(page.getByText(/no access to users’ notes, checklists, reminders/)).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Articles' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Sources' })).toBeVisible();
});
