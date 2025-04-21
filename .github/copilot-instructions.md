# AI Rules for My Prompt Pocket app

MyPromptPocket is a web application for managing a private library of prompts used with Large Language Models (LLMs). It allows users to create, edit, parameterize, and organize prompts efficiently with features like parameter templates, tagging system, and AI-assisted improvements. The app helps users avoid recreating similar prompts, ensures consistency, and provides quick access to their prompt library across devices with a responsive interface.

## Tech Stack

- Astro 5
- TypeScript 5
- React 19
- Tailwind 4
- Shadcn/ui

## Project structure

When introducing changes to the project, always follow the directory structure below:

- "./src" - source code
- "./src/pages" - Astro pages
- "./src/shared" - shared code between modules
- "./src/shared/components" - reusable components
- "./src/shared/components/ui" - reusable UI components
- "./src/shared/components/layout" - reusable layout components
- "./src/shared/(hooks|types|utils|styles)" - shared code between modules
- "./src/modules" - module-specific code
- "./src/modules/prompts" - code related to prompts module
- "./src/modules/{{module_name}}/client/(components|hooks|services|utils)" - client code related to a specific module
- "./src/modules/{{module_name}}/server/(repositories|services|exceptions|utils)" - server code related to a specific module
- "./src/modules/{{module_name}}/shared/(utils|schemas|types)" - shared client and server code related to a specific module
