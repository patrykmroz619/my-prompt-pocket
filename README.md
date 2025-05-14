# MyPromptPocket

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)

## Project Description

MyPromptPocket is a robust web application designed to streamline the management of your personal prompt library. It empowers users to create, edit, and parameterize prompts. With features such as tag-based categorization, quick search, AI-powered improvement suggestions, and clipboard integration, it effectively addresses issues like repetitive prompt creation, inconsistency, and inefficient storage. Ideal for professionals and AI enthusiasts alike, it offers a seamless solution for interacting with advanced AI language models.

## Tech Stack

- **Frontend**: Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend**: Supabase
- **AI Integration**: Openrouter.ai

## Getting Started Locally

1. Ensure you have [Node.js](https://nodejs.org/en/) version **22.14.0** (as specified in [.nvmrc](.nvmrc)).
2. Clone the repository:

   ```bash
   git clone https://github.com/patrykmroz619/my-prompt-pocket.git
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up Supabase:

   - Install Supabase CLI globally:

     ```bash
     npm install -g supabase
     ```

   - Start Supabase locally:

     ```bash
     npm run supabase:start
     ```

   - Copy the generated environment variables to `.env`:

     ```bash
     supabase status -o env > .env
     ```

   - Run database migrations:

     ```bash
     supabase migration up
     ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open your browser at `http://localhost:3000` to view the application.

## Available Scripts

- **npm run dev**: Starts the development server.
- **npm run build**: Builds the application for production.
- **npm run start**: Starts the production preview server.
- **npm run astro**: Runs Astro CLI commands.
- **npm run test**: Runs unit and integration tests.
- **npm run test:e2e**: Runs end-to-end tests.
- **npm run lint**: Lints the codebase.
- **npm run lint:fix**: Lints the codebase and automatically fixes issues.

## Project Scope

**In Scope:**

- Private prompt library for logged-in users.
- Creation, editing, and deletion of prompts.
- Automatic detection of prompt parameters.
- Tag-based organization and search functionality.
- AI support for enhancing prompt quality.

**Out of Scope:**

- Desktop applications (planned for future).
- Prompt versioning or archiving.
- Sharing prompts between users.
- Multilingual support and hierarchical categorization.

## Project Status

This project is in its MVP stage. Core functionalities have been implemented with plans for additional enhancements based on user feedback.
