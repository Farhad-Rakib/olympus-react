import { test, expect } from '@playwright/test';
import { api, apiLogin, login, USERS } from './helpers';
import { startMockOAuth } from './mock-oauth';

// Needs the API started with Google pointed at the mock provider (see README). Skipped otherwise.
const MOCK_PORT = Number(process.env.E2E_MOCK_OAUTH_PORT ?? 5099);

async function googleStatus() {
  const sa = await apiLogin(USERS.superadmin.email, USERS.superadmin.password);
  const res = await api('GET', '/auth/providers/status', undefined, sa.accessToken);
  return { token: sa.accessToken, google: (res.json?.data ?? []).find((p: { id: string }) => p.id === 'google') };
}

async function setGoogleFlag(token: string, on: boolean) {
  await api('POST', '/SiteSettings', {
    id: 0, key: 'Auth.Google.Enabled', value: String(on), description: "Show 'Continue with Google' on the login page",
  }, token);
}

test.describe('External sign-in', () => {
  test('login page shows a friendly message for provider errors', async ({ page }) => {
    await page.goto('/login?error=external_email_in_use');
    await expect(page.getByText(/already exists\. Sign in with your password/)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('admin enables Google in settings, then a visitor signs in with it', async ({ page, browser }) => {
    const { token, google } = await googleStatus();
    test.skip(!google?.configured, 'API is not configured with the mock OAuth provider');

    const mock = await startMockOAuth(MOCK_PORT);
    try {
      await setGoogleFlag(token, false);

      // 1. Admin switches Google on in Site Settings.
      await login(page, USERS.superadmin);
      await page.goto('/site-settings');
      const toggle = page.getByRole('switch', { name: 'Google' });
      await expect(toggle).toHaveAttribute('aria-checked', 'false');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-checked', 'true');

      // 2. A signed-out visitor now sees the button and signs in through the provider.
      const visitor = await (await browser.newContext()).newPage();
      const name = `Google Visitor ${Date.now()}`;
      mock.setIdentity({ sub: `pw-${Date.now()}`, email: `google-${Date.now()}@e2e.local`, email_verified: true, name });
      await visitor.goto('/login');
      await visitor.getByRole('link', { name: 'Continue with Google' }).click();
      await expect(visitor).toHaveURL(/\/dashboard/, { timeout: 15_000 });
      await expect(visitor.locator('header').getByText(name)).toBeVisible();

      // 3. Switching it off hides the button again.
      await page.getByRole('switch', { name: 'Google' }).click();
      await expect(page.getByRole('switch', { name: 'Google' })).toHaveAttribute('aria-checked', 'false');
      const fresh = await (await browser.newContext()).newPage();
      await fresh.goto('/login');
      await expect(fresh.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
      await expect(fresh.getByRole('link', { name: /Continue with/ })).toHaveCount(0);
    } finally {
      await setGoogleFlag(token, false);
      await mock.close();
    }
  });
});
