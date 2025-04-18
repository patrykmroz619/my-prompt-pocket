# Tech Stack - My Prompt Pocket

## 1. Frontend

The application uses an Astro-based architecture with React components for interactive parts, ensuring optimal performance while maintaining interactivity where needed.

### Main technologies

- **Astro 5** - Framework for creating fast websites with minimal JavaScript, using static rendering and island architecture.
- **React 19** - Library for building interactive UI components, used selectively only in places requiring interactivity.
- **TypeScript 5** - Programming language extending JavaScript with static typing, providing better error detection during compilation and IDE support.
- **Tailwind CSS 4** - Tool for creating user interfaces based on utility classes, enabling rapid design without leaving the HTML/JSX file.
- **Shadcn/ui** - Collection of UI components built on Radix UI and styled with Tailwind CSS, offering accessible and easy-to-customize interface elements.

## 2. Backend

Supabase serves as a comprehensive backend solution, eliminating the need to build a custom API and manage infrastructure.

### Key features

- **PostgreSQL Database** - Efficient and reliable relational database with extensions for spatial operations, full-text search, and JSON.
- **SDK for multiple languages** - Ready-to-use client libraries acting as Backend-as-a-Service, enabling database interaction directly from the frontend.
- **Open Source** - Solution with open source code that can be hosted locally or on your own server, providing flexibility and control over data.
- **Built-in Authentication** - Authentication system supporting email/password login, OAuth (Google, GitHub, etc.), and magic links.

## 3. AI Integration

Communication with AI models is handled through Openrouter.ai, providing flexibility in model selection and cost control.

### Advantages of this approach

- **Access to multiple providers** - The platform provides a unified interface to models from various providers (OpenAI, Anthropic, Google, etc.), allowing testing and selection of optimal solutions.
- **Cost optimization** - Ability to set spending limits on API keys and select models with the best price-to-performance ratio for specific applications.
- **Easy model migration** - When better models appear or pricing changes, it's possible to quickly switch to another model without changes in the application code.

## 4. CI/CD and Hosting

### Deployment infrastructure

- **GitHub Actions** - Automated CI/CD workflows that handle testing, building, and deploying the application after each repository change.
- **DigitalOcean** - Cloud platform for hosting applications via Docker containers, offering good performance at reasonable costs.

## 5. Testing Tools and Methodology

The application employs a comprehensive testing strategy across multiple layers to ensure quality and reliability.

### Testing tools

- **Vitest** - Fast test runner for unit and integration testing in JavaScript/TypeScript projects.
- **React Testing Library** - Library for testing React components by simulating user behavior.
- **Playwright** - End-to-end testing frameworks for simulating real user scenarios in actual browsers.
- **Mock Service Worker (MSW)** - Tool for intercepting and mocking HTTP requests during testing.

## 6. Development Tools

- **Bun** - Fast JavaScript runtime for executing scripts and managing packages, providing a modern alternative to Node.js.
