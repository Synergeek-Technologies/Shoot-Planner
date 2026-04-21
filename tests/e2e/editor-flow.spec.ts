import { test, expect } from '@playwright/test';
import { createUserWithRole } from '../integration/_helpers';

test('editor can create brand → shoot → reel and change status', async ({ page }) => {
  const { email } = await createUserWithRole('editor');
  const password = 'test-password-123';

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/brands');
  await page.getByRole('button', { name: /new brand/i }).click();
  await page.getByLabel('Name').fill('E2E Brand');
  await page.getByRole('button', { name: /^create$/i }).click();
  await expect(page.getByRole('heading', { name: 'E2E Brand' })).toBeVisible();

  await page.getByRole('button', { name: /new shoot/i }).click();
  await page.getByLabel('Title').fill('E2E Shoot');
  await page.getByLabel(/date/i).fill('2026-06-15T10:00');
  await page.getByRole('button', { name: /^create$/i }).click();
  await expect(page.getByRole('heading', { name: 'E2E Shoot' })).toBeVisible();

  await page.getByRole('button', { name: /new reel/i }).click();
  await page.getByLabel('Title').fill('E2E Reel');
  await page.getByRole('button', { name: /^create$/i }).click();

  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: /shot/i }).click();
  await expect(page.getByRole('combobox').first()).toContainText(/shot/i);
});
