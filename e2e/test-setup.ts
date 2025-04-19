/**
 * E2E test setup and helpers
 */
import type { Page } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

/**
 * Test user data
 */
export const TEST_USERS = {
  standard: {
    email: process.env.E2E_USER_EMAIL ?? '',
    password: process.env.E2E_USER_PASSWORD ?? '',
  }
};

/**
 * Helper function to authenticate a user programmatically
 * This can be used in tests where authentication is a prerequisite
 * but not the focus of the test
 */
export async function authenticateUser(page: Page, email: string, password: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  // Wait for successful navigation to main page
  await page.waitForURL('/');
}

/**
 * Reset test user data
 *
 * This could be expanded to call an API to reset user data between tests
 * or create a new test user with clean data
 */
export async function resetTestData(): Promise<void> {
  // In a real implementation, this might call an API to reset/setup test data
  // For example:
  // await fetch('http://localhost:8000/api/test/reset-data', { method: 'POST' });
  console.log('Resetting test data');
}
