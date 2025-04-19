/**
 * Page Object Model for the Login page
 */
import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly googleLoginButton: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Log in', exact: false });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.registerLink = page.getByRole('link', { name: 'Register' });
    this.googleLoginButton = page.getByRole('button', { name: 'Google' });
    // Error messages appear in toast notifications
    this.errorToast = page.getByText('Invalid login credentials');
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/auth/login');
  }

  /**
   * Perform login with email and password
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.emailInput.press('Tab');
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Check if user is redirected to the main page after successful login
   */
  async isLoggedIn() {
    // Wait for navigation to the main page after login
    await this.page.waitForURL('/');
    return this.page.url().endsWith('/');
  }
}
