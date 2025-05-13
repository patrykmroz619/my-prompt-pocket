/**
 * E2E tests for email/password login functionality
 *
 * User Story (US-002):
 * As a registered user, I want to log in to the system using my email and password
 * to access my prompts.
 */
import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/login.page";
import { TEST_USERS } from "./test-setup";
import { delay } from "./utils/delay";

// Test data
const validUser = TEST_USERS.standard;

const invalidCredentials = {
  email: "wrong@example.com",
  password: "WrongP@ssw0rd",
};

test.describe("Email/Password Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();

    // Verify we're on the login page
    await expect(page).toHaveTitle(/Login | MyPromptPocket/);
  });

  test("should display login form with all elements", async () => {
    // Verify all form elements are present
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
    await expect(loginPage.googleLoginButton).toBeVisible();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    // Fill form and submit
    await loginPage.login(validUser.email, validUser.password);

    await delay(5000);

    // Verify successful login - redirected to main page
    await expect(page.getByText("My Prompts")).toBeVisible();
  });

  test("should show error message with invalid credentials", async () => {
    // Attempt login with invalid credentials
    await loginPage.login(invalidCredentials.email, invalidCredentials.password);

    await delay(1000);

    // Verify error message is shown in toast notification
    await expect(loginPage.toast).toBeVisible();

    // Verify we're still on the login page
    await expect(loginPage.page).toHaveURL(/.*\/auth\/login/);
  });

  test("should validate required fields", async ({ page }) => {
    // Attempt to submit form without filling fields
    await loginPage.loginButton.click();

    // Verify form validation messages
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("should navigate to forgot password page", async ({ page }) => {
    // Click on forgot password link
    await loginPage.forgotPasswordLink.click();

    // Verify navigation to forgot password page
    await expect(page).toHaveURL(/.*\/auth\/forgot-password/);
  });

  test("should navigate to registration page", async ({ page }) => {
    // Click on registration link
    await loginPage.registerLink.click();

    // Verify navigation to registration page
    await expect(page).toHaveURL(/.*\/auth\/register/);
  });

  /**
   * Visual comparison test to detect unexpected UI changes
   */
  test("login page visual appearance", async ({ page }) => {
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot("login-page.png");
  });
});
