# MyPromptPocket - Test Plan

## 1. Introduction and Testing Objectives

### 1.1 Introduction

This document outlines the testing strategy for the MyPromptPocket application, a web-based tool for managing Large Language Model (LLM) prompts. The application is built using Astro, React, TypeScript, Tailwind CSS, Shadcn/ui, and Supabase. This plan details the scope, approach, resources, and schedule of testing activities.

### 1.2 Testing Objectives

- Verify that all functional requirements specified in the PRD ([`docs/prd.md`](docs/prd.md)) are met.
- Ensure the application is secure, particularly regarding user authentication and data isolation ([`docs/auth-spec.md`](docs/auth-spec.md), [`docs/db-plan.md`](docs/db-plan.md)).
- Validate the reliability and correctness of core features like prompt CRUD, parameterization, and tagging.
- Confirm the application provides a consistent and intuitive user experience across supported browsers and devices ([`docs/ui-plan.md`](docs/ui-plan.md)).
- Identify and report defects to ensure a high-quality release.
- Verify API endpoints function according to the API plan ([`docs/api-plan.md`](docs/api-plan.md)), including request/response validation and error handling.
- Ensure seamless integration between the frontend (Astro/React) and backend (Supabase/Astro API Routes).
- Validate the integration with the external AI service (Openrouter.ai) for prompt improvement ([`docs/tech-stack.md`](docs/tech-stack.md)).

## 2. Scope of Testing

### 2.1 In Scope

- **Authentication:** User registration (Email/Password), Login (Email/Password, Google OAuth), Logout, Session Management, Password Recovery (if implemented), Route Protection/Authorization.
- **Prompt Management:** Create, Read (List View, Detail View), Update, Delete prompts.
- **Parameterization:** Parameter detection (`{{parameter}}`), type assignment (short/long text), parameter filling, validation, clipboard copy.
- **Tag Management:** Tag creation (implicitly via prompt association), associating tags with prompts, removing tags from prompts.
- **Search & Filtering:** Searching prompts by name, filtering prompts by tags.
- **API Endpoints:** Testing all endpoints defined in [`docs/api-plan.md`](docs/api-plan.md) (`/api/auth/*`, `/api/prompts/*`, `/api/tags/*`, `/api/prompt-tags/*`).
- **AI Integration:** Prompt improvement feature (`/api/prompts/improve`).
- **UI/UX:** Responsiveness, usability, consistency across views (Login, Register, Prompt List, Prompt Form, Modals), form validation feedback, notifications.
- **Database:** Data integrity (uniqueness constraints, foreign keys, RLS policies).
- **Security:** Basic security checks (e.g., ensuring users can only access their own data).
- **Cross-Browser Compatibility:** Testing on latest versions of Chrome, Firefox, Edge, Safari.
- **Cross-Device Compatibility:** Testing on Desktop, Tablet, and Mobile viewports.

### 2.2 Out of Scope

- Third-party integrations beyond Supabase Auth, Google OAuth, and Openrouter.ai.
- Load testing beyond basic performance checks.
- Usability testing with a large external user group (focus is on functional correctness for MVP).
- Infrastructure testing (handled by Supabase/DigitalOcean).
- Features explicitly marked as out of scope in [`docs/prd.md`](docs/prd.md) (e.g., prompt versioning, sharing).

## 3. Types of Tests to be Performed

- **Unit Testing:**
  - Focus: Individual functions, components (React), utility functions ([`src/shared/utils`](src/shared/utils), `src/modules/*/utils`).
  - Tools: Vitest, React Testing Library.
  - Areas: Parameter extraction logic ([`extractParametersFromContent.util`](src/modules/prompts/utils/extractParametersFromContent.util.ts)), validation logic ([`prompt.service.ts`](src/modules/prompts/services/prompt.service.ts)), UI component rendering and basic interactions.
- **Integration Testing:**
  - Focus: Interactions between components, frontend-backend communication, API route logic, service-repository interactions, external API integration.
  - Tools: Vitest, React Testing Library (for component integration), Supertest (for API routes), Mock Service Worker (MSW) or similar for mocking Supabase/Openrouter.ai.
  - Areas: API route handlers ([`src/pages/api/prompts/index.ts`](src/pages/api/prompts/index.ts)) calling services/repositories, React components fetching data from APIs, Supabase RLS policy enforcement (requires specific test setup).
- **End-to-End (E2E) Testing:**
  - Focus: Simulating real user scenarios from the browser.
  - Tools: Playwright or Cypress.
  - Areas: Complete user flows like Registration -> Login -> Create Prompt -> Edit Prompt -> Fill Parameters -> Logout. Testing Astro page rendering and React island hydration.
- **API Testing:**
  - Focus: Directly testing API endpoints for functionality, validation, error handling, authentication, and contract adherence.
  - Tools: Postman, Insomnia, or automated scripts (e.g., using `fetch` in test runners).
  - Areas: All endpoints in [`docs/api-plan.md`](docs/api-plan.md), testing various HTTP methods, request bodies, query parameters, headers (Authorization), and expected responses/status codes. Testing Zod schema validation ([`createPromptSchema`](src/modules/prompts/schemas/create-prompt.schema.ts)).
- **Manual Exploratory Testing:**
  - Focus: Unscripted testing to discover usability issues, edge cases, and unexpected behavior.
  - Areas: Exploring different user paths, trying unusual inputs, testing responsiveness manually.
- **Visual Regression Testing:**
  - Focus: Detecting unintended UI changes.
  - Tools: Playwright with visual comparison, Chromatic, Percy.
  - Areas: Key pages and components, especially after CSS/Tailwind/Shadcn/ui updates.
- **Accessibility Testing:**
  - Focus: Ensuring the application is usable by people with disabilities.
  - Tools: Axe DevTools, browser developer tools, manual testing with screen readers (NVDA, VoiceOver).
  - Areas: Semantic HTML, ARIA attributes, keyboard navigation, color contrast, focus management (especially in modals).
- **Performance Testing (Basic):**
  - Focus: Initial page load times, API response times under normal conditions.
  - Tools: Browser developer tools (Lighthouse, Network tab), `console.time`.
  - Areas: Core pages (Prompt List), critical API endpoints (GET /api/prompts).

## 4. Test Scenarios for Key Functionalities

_(Note: This is a non-exhaustive list, detailed test cases will be derived from these scenarios)_

- **Authentication:**
  - Verify successful registration with valid credentials.
  - Verify registration failure with invalid email/password/mismatched passwords.
  - Verify successful login with correct email/password.
  - Verify login failure with incorrect credentials.
  - Verify successful login with Google OAuth.
  - Verify redirection after login/logout.
  - Verify session persistence and expiry.
  - Verify access denial to protected routes when logged out.
  - Verify access grant to protected routes when logged in.
- **Prompt Creation:**
  - Verify successful creation with minimum required fields (name, content).
  - Verify successful creation with all optional fields (description, tags, parameters).
  - Verify failure when creating a prompt with a duplicate name for the same user.
  - Verify failure when content contains parameters but `parameters` definition array is missing/incomplete ([`MissingParameterDefinitionsError`](src/modules/prompts/exceptions/prompt.exceptions.ts), [`UndefinedParametersError`](src/modules/prompts/exceptions/prompt.exceptions.ts)).
  - Verify parameters are correctly extracted and stored.
  - Verify tags are correctly associated.
  - Verify correct API response (201 Created, [`PromptDto`](src/shared/types/types.ts)).
- **Prompt Editing:**
  - Verify successful update of all fields (name, description, content, parameters, tags).
  - Verify failure when changing name to an existing prompt name for the same user ([`PromptNameConflictError`](src/modules/prompts/exceptions/prompt.exceptions.ts)).
  - Verify parameter list updates dynamically as content changes.
  - Verify tag associations can be added/removed.
  - Verify failure when editing a non-existent prompt (404 Not Found).
  - Verify only the prompt owner can edit the prompt.
- **Prompt Listing & Filtering:**
  - Verify prompts are listed correctly for the logged-in user.
  - Verify pagination works correctly.
  - Verify sorting works correctly (by name, created_at, updated_at; asc/desc).
  - Verify search by name returns correct results.
  - Verify filtering by one or more tags returns correct results.
  - Verify empty states are handled correctly (no prompts, no search/filter results).
- **Parameter Handling:**
  - Verify parameters `{{param}}` are correctly detected in the content input.
  - Verify parameter types can be assigned (short-text, long-text).
  - Verify the "Fill Parameters" modal appears for prompts with parameters.
  - Verify correct input fields are rendered based on parameter type.
  - Verify the final prompt content is correctly generated after filling parameters.
  - Verify the "Copy to Clipboard" functionality works.
- **Data Isolation (RLS):**
  - Verify User A cannot view/edit/delete prompts belonging to User B via UI or direct API calls.
  - Verify User A cannot view/use tags belonging to User B.

## 5. Test Environment

- **Development:** Local machine using `npm run dev` and local Supabase instance (`supabase start`) as per [`README.md`](README.md).
- **Staging (Optional but Recommended):** A dedicated environment mirroring production (e.g., deployed on DigitalOcean with a separate Supabase project) for pre-release testing.
- **Production:** Live environment (DigitalOcean/Supabase).
- **Browsers:** Latest stable versions of Chrome, Firefox, Safari, Edge.
- **Operating Systems:** Windows, macOS (Linux optional).
- **Devices:** Desktop (various resolutions), Simulated Tablet/Mobile (Browser DevTools), Real devices (optional).

## 6. Testing Tools

- **Test Runner:** Vitest
- **Component Testing:** React Testing Library
- **E2E Testing:** Playwright / Cypress
- **API Testing:** Postman / Insomnia / Automated scripts (Supertest/fetch)
- **Visual Regression:** Playwright / Chromatic / Percy
- **Accessibility:** Axe DevTools / Screen Readers (NVDA/VoiceOver)
- **Mocking:** Mock Service Worker (MSW) / Vitest Mocks
- **Bug Tracking:** GitHub Issues / Jira (or similar)
- **Test Case Management:** TestRail / Xray / Zephyr Scale (or simple Markdown/Spreadsheets for smaller scale)

## 7. Test Schedule

_(To be defined based on project timeline and milestones)_

- **Phase 1: Setup & Planning:** (Current Phase) Define strategy, setup tools, write initial test cases.
- **Phase 2: Unit & Integration Testing:** Parallel to development sprints. Developers write unit tests; QA focuses on integration tests.
- **Phase 3: API & E2E Testing:** As features become available/stable. Focus on core flows and API contracts.
- **Phase 4: System & User Acceptance Testing (UAT):** Near release candidate stage. Includes exploratory testing, cross-browser testing, accessibility checks.
- **Phase 5: Regression Testing:** Before release and after major bug fixes. Rerun key E2E and manual test suites.
- **Phase 6: Post-Release Testing:** Sanity checks in the production environment.

## 8. Test Acceptance Criteria

- All High Priority test scenarios pass.
- > 95% of Medium Priority test scenarios pass.
- No outstanding Blocker or Critical severity bugs related to core functionality or security.
- All API endpoints conform to the documented contract ([`docs/api-plan.md`](docs/api-plan.md)).
- Application functions correctly on all specified browsers and devices.
- Key accessibility standards (e.g., WCAG AA) are met for core flows.
- Documentation (if applicable) reflects the tested functionality.

## 9. Roles and Responsibilities

- **Developers:**
  - Write and maintain unit tests for their code.
  - Perform initial integration testing for their features.
  - Fix bugs reported by QA.
  - Collaborate with QA on understanding requirements and reproducing issues.
- **QA Engineer(s):**
  - Develop and maintain the test plan and test cases.
  - Execute integration, API, E2E, exploratory, accessibility, and regression tests.
  - Report and track defects.
  - Verify bug fixes.
  - Maintain testing tools and environments.
  - Provide feedback on usability and requirements.
- **Product Owner/Manager:**
  - Clarify requirements and acceptance criteria.
  - Prioritize bug fixes.
  - Participate in UAT.

## 10. Bug Reporting Procedures

- **Tool:** GitHub Issues / Jira (or chosen tool).
- **Workflow:**
  1.  **Detection:** Identify a deviation from expected behavior.
  2.  **Verification:** Reproduce the bug consistently. Check if it's already reported.
  3.  **Reporting:** Create a new bug report including:
      - **Title:** Clear and concise summary of the issue.
      - **Description:** Detailed steps to reproduce the bug.
      - **Expected Result:** What should have happened.
      - **Actual Result:** What actually happened.
      - **Environment:** Browser, OS, Device, Test Environment (Dev/Staging).
      - **Severity:** (e.g., Blocker, Critical, Major, Minor, Trivial) - Based on impact.
      - **Priority:** (e.g., High, Medium, Low) - Based on urgency to fix.
      - **Screenshots/Videos:** Attach relevant media.
      - **Logs:** Attach relevant console or network logs if applicable.
      - **Labels/Tags:** Assign relevant labels (e.g., `bug`, `ui`, `api`, `auth`).
  4.  **Assignment:** Assign the bug to the relevant developer or team lead.
  5.  **Resolution:** Developer fixes the bug and marks it as resolved.
  6.  **Verification:** QA re-tests the bug fix in the specified environment.
  7.  **Closure:** If verified, QA closes the bug report. If not, QA reopens it with comments.
