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
- "./src/shared/hooks" - reusable hooks
- "./src/shared/utils" - reusable utility functions
- "./src/shared/types" - reusable types
- "./src/modules" - module-specific code
- "./src/modules/prompts" - code related to prompts
- "./src/modules/{{module_name}}" - code related to a specific module
- "./src/modules/{{module_name}}/components" - module-specific components
- "./src/modules/{{module_name}}/types" - module-specific types
- "./src/modules/{{module_name}}/hooks" - module-specific hooks
- "./src/modules/{{module_name}}/utils" - module-specific utility functions
- "./src/modules/{{module_name}}/services" - module-specific services
- "./src/modules/{{module_name}}/repositories" - module-specific repositories
- "./src/modules/{{module_name}}/styles" - module-specific styles
