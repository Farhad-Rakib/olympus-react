import { expect, Page } from '@playwright/test';

export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:5091/api/v1';
export const PASSWORD = 'Passw0rd!123';

export const USERS = {
  superadmin: { email: 'superadmin@localhost', password: 'SuperAdmin@123!' },
  admin: { email: 'admin-test@e2e.local', password: PASSWORD, name: 'Admin Test' },
  manager: { email: 'manager-test@e2e.local', password: PASSWORD, name: 'Manager Test' },
  user: { email: 'user-test@e2e.local', password: PASSWORD, name: 'User Test' },
  norole: { email: 'norole-test@e2e.local', password: PASSWORD, name: 'NoRole Test' },
};

export async function api(method: string, path: string, body?: unknown, token?: string) {
  const res = await fetch(API_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test helper returns untyped API JSON
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  return { status: res.status, json };
}

export async function apiLogin(email: string, password: string) {
  const { json } = await api('POST', '/auth/login', { email, password });
  return json?.data as { accessToken: string; refreshToken: string };
}

export async function login(page: Page, user: { email: string; password: string }) {
  await page.goto('/login');
  await page.locator('#email').fill(user.email);
  await page.locator('#password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

export async function logout(page: Page) {
  await page.locator('header button:has(div.rounded-full)').last().click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
}

/** Collects console errors and failed API/asset requests for a page. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    // Failed requests are reported below with their URL; skip the URL-less console duplicate.
    if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.request().method()} ${r.url()}`);
  });
  page.on('requestfailed', (r) => errors.push(`failed: ${r.url()} ${r.failure()?.errorText}`));
  return errors;
}

export function sidebar(page: Page) {
  return page.locator('aside');
}
