import { test, expect } from '@playwright/test';
import { api, apiLogin, login, logout, sidebar, trackErrors, USERS } from './helpers';

const STORAGE_KEY = 'admin_token';

test.describe('Smoke', () => {
  test('SMK-003 login page renders without console errors or failed assets @responsive', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('Authentication', () => {
  test('AUTH-001 valid login redirects to dashboard and stores session', async ({ page }) => {
    await login(page, USERS.admin);
    const stored = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
    expect(stored).toContain('accessToken');
    expect(stored).toContain('refreshToken');
  });

  test('AUTH-002 invalid password shows an error and stores no token', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(USERS.admin.email);
    await page.locator('#password').fill('wrong-password-1');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    const stored = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
    expect(stored ?? '').not.toMatch(/"accessToken":"ey/);
  });

  test('AUTH-003 empty form is blocked client-side', async ({ page }) => {
    let loginCalls = 0;
    page.on('request', (r) => { if (r.url().includes('/auth/login')) loginCalls++; });
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login/);
    expect(loginCalls).toBe(0);
  });

  test('AUTH-004 session survives a browser refresh', async ({ page }) => {
    await login(page, USERS.admin);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(sidebar(page)).toBeVisible();
  });

  test('AUTH-005 invalid access token is refreshed once and the page keeps working', async ({ page }) => {
    await login(page, USERS.admin);
    await page.evaluate((k) => {
      const raw = JSON.parse(localStorage.getItem(k)!);
      raw.state.accessToken = 'invalid.access.token';
      localStorage.setItem(k, JSON.stringify(raw));
    }, STORAGE_KEY);
    const refreshCalls: number[] = [];
    page.on('response', (r) => { if (r.url().toLowerCase().includes('/auth/refresh')) refreshCalls.push(r.status()); });
    await page.goto('/users');
    await expect(page.getByText(USERS.manager.email)).toBeVisible();
    expect(refreshCalls.length).toBe(1);
    expect(refreshCalls[0]).toBe(200);
  });

  test('AUTH-005b failed refresh redirects to login', async ({ page }) => {
    await login(page, USERS.admin);
    await page.evaluate((k) => {
      const raw = JSON.parse(localStorage.getItem(k)!);
      raw.state.accessToken = 'invalid.access.token';
      raw.state.refreshToken = 'invalid-refresh';
      localStorage.setItem(k, JSON.stringify(raw));
    }, STORAGE_KEY);
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('AUTH-006 logout clears session, revokes refresh token and protects routes', async ({ page }) => {
    await login(page, USERS.admin);
    const refreshToken = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!).state.refreshToken, STORAGE_KEY);
    await logout(page);
    const stored = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
    expect(stored ?? '').not.toMatch(/"accessToken":"ey/);
    const reuse = await api('POST', '/auth/refresh', { refreshToken });
    expect(reuse.status, 'refresh token should be revoked on logout').toBe(401);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await page.goBack();
    await expect(page).toHaveURL(/\/login/);
  });

  test('AUTH-007 forgot password shows a non-sensitive success message', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Forgot password?' }).click();
    await page.locator('#forgot-email').fill(USERS.user.email);
    await page.getByRole('button', { name: /send|reset/i }).click();
    await expect(page.getByText(/if an account exists|reset link|email sent|check your email/i)).toBeVisible();
  });

  test('AUTH-009 change password from the profile page', async ({ page }) => {
    const u = { email: USERS.norole.email, password: USERS.norole.password };
    await login(page, u);
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Change Password' }).click();
    const pw = page.locator('input[type="password"]');
    await pw.nth(0).fill(u.password);
    await pw.nth(1).fill('Chang3d!Pass');
    await pw.nth(2).fill('Chang3d!Pass');
    await page.getByRole('button', { name: 'Update Password' }).click();
    try {
      await expect(page.getByText(/password (changed|updated)/i)).toBeVisible();
      expect(await apiLogin(u.email, 'Chang3d!Pass')).toBeTruthy();
    } finally {
      // Restore the shared account even if the assertions fail, so later tests can log in.
      const changed = await apiLogin(u.email, 'Chang3d!Pass');
      if (changed) {
        await api('POST', '/auth/change-password', { userId: 0, currentPassword: 'Chang3d!Pass', newPassword: u.password }, changed.accessToken);
      }
    }
  });

  test('deep link while signed out redirects to login', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Authorization and navigation', () => {
  test('RBAC-001 admin sees administrative navigation', async ({ page }) => {
    await login(page, USERS.admin);
    await sidebar(page).getByRole('button', { name: 'Configuration' }).click();
    for (const name of ['Users', 'Roles', 'Permissions']) {
      await expect(sidebar(page).getByRole('link', { name, exact: true }).first()).toBeVisible();
    }
  });

  test('RBAC-002 manager only sees assigned menu items', async ({ page }) => {
    await login(page, USERS.manager);
    await sidebar(page).getByRole('button', { name: 'Configuration' }).click();
    await expect(sidebar(page).getByRole('link', { name: 'Users', exact: true }).first()).toBeVisible();
    await expect(sidebar(page).getByRole('link', { name: 'Roles', exact: true })).toHaveCount(0);
  });

  test('RBAC-003 direct navigation to an admin page does not bypass authorization', async ({ page }) => {
    await login(page, USERS.norole);
    await page.goto('/roles');
    const forbidden = page.getByRole('heading', { name: 'Access Denied' });
    const leaked = page.getByText('Administrative management access.');
    await expect(leaked).toHaveCount(0);
    await expect(forbidden, 'expected the 403 page for a user without roles.read').toBeVisible();
  });
});

test.describe('Administration', () => {
  test('ADM-001 users table loads with search', async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto('/users');
    await expect(page.getByText(USERS.manager.email)).toBeVisible();
    const search = page.getByPlaceholder(/search/i).first();
    await search.fill('manager-test');
    await expect(page.getByText(USERS.user.email)).toHaveCount(0);
    await expect(page.getByText(USERS.manager.email)).toBeVisible();
  });

  test('ADM-004 create a role through the UI and reject a duplicate', async ({ page }) => {
    const name = `UiRole${Date.now()}`;
    await login(page, USERS.superadmin);
    await page.goto('/roles');
    await page.getByRole('button', { name: 'Add Role' }).click();
    await page.locator('#name').fill(name);
    await page.locator('#description').fill('created by e2e');
    await page.getByRole('button', { name: 'Create Role' }).click();
    await expect(page.getByText(name)).toBeVisible();

    await page.getByRole('button', { name: 'Add Role' }).click();
    await page.locator('#name').fill(name);
    await page.locator('#description').fill('dup');
    await page.getByRole('button', { name: 'Create Role' }).click();
    await expect(page.getByText(/already exists/i)).toBeVisible();
  });

  test('ADM-new create a user through the UI without a role', async ({ page }) => {
    const email = `ui-${Date.now()}@e2e.local`;
    await login(page, USERS.superadmin);
    await page.goto('/users');
    await page.getByRole('button', { name: 'Add User' }).click();
    await expect(page.locator('#role')).toHaveCount(0);
    await page.locator('#fullName').fill('Ui Created');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('Passw0rd!123');
    await page.getByRole('button', { name: /create|save|add/i }).last().click();
    await expect(page.getByText(email)).toBeVisible();
  });
});

test.describe('Settings, profile and preferences', () => {
  test('CFG-001 site settings page renders from the API', async ({ page }) => {
    const errors = trackErrors(page);
    await login(page, USERS.superadmin);
    await page.goto('/site-settings');
    await expect(page.getByText(/Palette\.Dark|SiteName|Site Name/i).first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('CFG-005 dark mode preference persists across reload', async ({ page }) => {
    await login(page, USERS.user);
    const html = page.locator('html');
    const wasDark = (await html.getAttribute('class'))?.includes('dark') ?? false;
    await page.getByTitle(wasDark ? 'Switch to light mode' : 'Switch to dark mode').click();
    await page.reload();
    if (wasDark) await expect(html).not.toHaveClass(/dark/);
    else await expect(html).toHaveClass(/dark/);
    await page.getByTitle(wasDark ? 'Switch to dark mode' : 'Switch to light mode').click();
  });

  test('CFG-006 profile update is reflected in the header', async ({ page }) => {
    await login(page, USERS.manager);
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    const newName = `Manager ${Date.now() % 10000}`;
    await page.getByPlaceholder('Enter your full name').fill(newName);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
    await page.reload();
    await expect(page.locator('header').getByText(newName)).toBeVisible();
    await api('PUT', '/users/me', { fullName: USERS.manager.name, email: USERS.manager.email, profileImageUrl: null },
      (await apiLogin(USERS.manager.email, USERS.manager.password)).accessToken);
  });
});

test.describe('Dashboard, reports and pages', () => {
  for (const path of ['/dashboard', '/audit-logs', '/reports', '/preferences', '/roles', '/permissions', '/menu-management', '/users/roles', '/roles/permissions']) {
    test(`page ${path} renders without errors`, async ({ page }) => {
      const errors = trackErrors(page);
      await login(page, USERS.superadmin);
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { name: 'Page not found' })).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }
});

test.describe('Dashboard', () => {
  test('OPS-001 shows live metrics and recent activity', async ({ page }) => {
    await login(page, USERS.admin);
    await expect(page.getByText('API Activity')).toBeVisible();
    await expect(page.getByText(/Total Users · \d+ active/)).toBeVisible();
    await expect(page.locator('li').filter({ hasText: /GET|POST|PUT|DELETE/ }).first()).toBeVisible();
  });

  test('OPS-002 date range drives the API query', async ({ page }) => {
    await login(page, USERS.admin);
    const request = page.waitForRequest((r) => /\/Dashboard\?days=30/i.test(r.url()));
    await page.getByLabel('Date range').selectOption('30');
    await request;
    await expect(page.getByText('in the last 30 days')).toBeVisible();
  });

  test('users without reports.read get a welcome instead of metrics', async ({ page }) => {
    await login(page, USERS.user);
    await expect(page.getByText(/Welcome back/)).toBeVisible();
    await expect(page.getByText('API Activity')).toHaveCount(0);
  });
});

test.describe('Audit logs', () => {
  test('OPS-003 audit log lists entries, filters and shows details', async ({ page }) => {
    await login(page, USERS.admin);
    await sidebar(page).getByRole('button', { name: 'Configuration' }).click();
    await sidebar(page).getByRole('link', { name: 'Audit Logs' }).click();
    await expect(page).toHaveURL(/\/audit-logs/);
    await expect(page.getByRole('heading', { name: 'Audit Logs' })).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();

    const filtered = page.waitForResponse((r) => /\/Audit\?.*action=Menu/i.test(r.url()));
    await page.getByPlaceholder('Search by action or path...').fill('Menu');
    await filtered;
    await expect(page.locator('tbody tr').first()).toContainText('Menu');

    await page.getByTitle('View details').first().click();
    await expect(page.getByRole('heading', { name: 'Audit Entry' })).toBeVisible();
  });

  test('OPS-004 audit log is denied without audit.read', async ({ page }) => {
    await login(page, USERS.user);
    await page.goto('/audit-logs');
    await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
  });
});

test.describe('Notifications', () => {
  test('CFG-007/009 a notification arrives in real time and read state persists', async ({ page }) => {
    await login(page, USERS.user);
    const bell = page.locator('header button').filter({ has: page.locator('svg.lucide-bell') });
    await expect(bell).toBeVisible();

    const sa = await apiLogin(USERS.superadmin.email, USERS.superadmin.password);
    const me = await api('GET', '/users/me', undefined, (await apiLogin(USERS.user.email, USERS.user.password)).accessToken);
    const title = `Live ${Date.now()}`;
    const created = await api('POST', '/notifications',
      { userId: me.json.data.id, type: 'success', title, message: 'Pushed over SignalR' }, sa.accessToken);
    expect(created.status).toBe(201);

    // No reload: the hub pushes it, raising a toast and the unread badge.
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 10_000 });
    await bell.click();
    const item = page.getByText(title).last();
    await expect(item).toBeVisible();

    await page.getByRole('button', { name: /mark all read/i }).click();
    await page.reload();
    const list = await api('GET', '/notifications', undefined, (await apiLogin(USERS.user.email, USERS.user.password)).accessToken);
    expect(list.json.data.find((n: { title: string }) => n.title === title)?.isRead).toBe(true);
  });
});

test('regular user pages load without console or API errors', async ({ page }) => {
  const errors = trackErrors(page);
  await login(page, USERS.user);
  for (const path of ['/dashboard', '/profile', '/preferences', '/users']) {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    await page.waitForTimeout(1000);
  }
  expect(errors).toEqual([]);
});

test.describe('Responsive', () => {
  test('dashboard has no horizontal scroll @responsive', async ({ page }) => {
    await login(page, USERS.admin);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('login form fields are labelled @responsive', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  });
});
