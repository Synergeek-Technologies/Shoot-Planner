import { test, expect } from '@playwright/test';
import { createUserWithRole } from '../integration/_helpers';

test('viewer sees data but cannot edit', async ({ page }) => {
  const { email } = await createUserWithRole('viewer');
  const password = 'test-password-123';

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/brands');
  await expect(page.getByRole('heading', { name: /brands/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /new brand/i })).toHaveCount(0);
});
