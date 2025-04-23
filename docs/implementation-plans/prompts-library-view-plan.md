# View Implementation Plan: Prompts Library

## 1. Overview

The "Prompts Library" view (`/prompts`) displays a paginated grid of user-owned prompts. Users can search by name, filter by tags, and navigate through pages. Each prompt card shows name, description excerpt, creation date, and tags. Accessibility and keyboard navigation are prioritized.

## 2. View Routing

- Route path: `/prompts`
- Defined in Astro pages: `src/pages/prompts.astro`
- Protected: requires authenticated user context

## 3. Component Structure

- PromptsPage (page container)
  - SearchBar
  - TagFilter (multi-select Combobox)
  - PromptGrid
    - PromptCard (repeated)
  - PaginationControls

## 4. Component Details

### PromptsPage

- Purpose: orchestrates state, uses initial props, fetches updates on client
- Props:
  - `initialData: PromptsResponse` // initial prompts and pagination from server
- Local state:
  - `search: string`
  - `selectedTagIds: string[]`
  - `page: number`
  - `prompts: PromptDto[]` // initialized from initialData.data
  - `pagination: PaginationInfo` // initialized from initialData.pagination
- Hooks:
  - `usePromptsData(search, selectedTagIds, page, { initialData })` // uses props to seed first render

### SearchBar

- Description: input with debounce (300ms)
- Elements: `<input type="search" />`
- Props:
  - `value: string`
  - `onChange(value: string): void`
- Validation: none
- Events: `onInput`, triggers `onChange`

### TagFilter

- Description: multi-select Combobox of all tags
- Elements: Combobox trigger, dropdown list, items, clear button
- Props:
  - `options: TagDto[]`
  - `value: string[]`
  - `onChange(value: string[]): void`
- Validation: none

### PromptGrid

- Description: displays grid or empty message
- Elements: CSS grid container
- Props:
  - `prompts: PromptDto[]`
- Behavior: if empty → show “No prompts found.”

### PromptCard

- Description: card with prompt summary
- Elements: title, description excerpt (`max-lines:4`), date formatted, tags list
- Props:
  - `prompt: PromptDto`
- Accessibility: role="button", tabindex="0"
- Events: click → navigate to `/prompts/[id]`

### PaginationControls

- Description: page navigation with prev/next and page numbers
- Props:
  - `pagination: PaginationInfo`
  - `onPageChange(page: number): void`
- Validation: disable prev if on first, next if on last

## 5. Types

```typescript
type TagDto = {
  id: string;
  name: string;
};
type PromptDto = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  tags: TagDto[];
};
type PaginationInfo = {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
};
type PromptsResponse = {
  data: PromptDto[];
  pagination: PaginationInfo;
};
```

## 6. State Management

- useState for `search`, `selectedTagIds`, `page`.
- Custom hook `usePromptsData(search, tags, page)`:
  - Manages loading, error, data
  - Debounces search
  - Calls `/api/prompts?search=&tags=&page=`

## 7. API Integration

- Endpoint: `GET /api/prompts`
- Query: `search=${search}&tags=${tags.join(',')}&page=${page}`
- Request type: none (query only)
- Response type: `PromptsResponse`
- Fetch inside `usePromptsData`, handle JSON, map to state

## 8. User Interactions

- Typing in SearchBar → debounced update → reload grid
- Selecting tags in TagFilter → immediate update → reload grid
- Clicking PromptCard → navigate to detail view
- Changing page in PaginationControls → update page state → reload grid

## 9. Conditions and Validation

- Search input: allow empty or any string
- TagFilter: allow zero or multiple selections
- Page number: must be between 1 and total_pages
- If API returns validation error → display toast “Invalid filter parameters.”

## 10. Error Handling

- Loading state: show spinner in grid area
- API error (network or 500): show error banner with retry button
- Empty result: show “No prompts found.”
- Debounce search to reduce API load

## 11. Implementation Steps

1. Create `src/pages/prompts.astro`:
   - Perform server‑side fetch of `/api/prompts` (no filters)
   - Pass response as `initialData` prop into `<PromptsPage initialData={initialData} />`
2. Define types in `src/shared/types/prompts.ts`.
3. Implement `usePromptsData` in `src/shared/hooks/usePromptsData.ts` to accept optional `initialData`.
4. Build `SearchBar` and `TagFilter` in `src/shared/components/ui/`.
5. Build `PromptCard` and `PromptGrid` in `src/shared/components/layout/`.
6. Implement `PaginationControls` component.
7. Compose components in `PromptsPage`, wire state (seeded from props) and handlers.
8. Add CSS with Tailwind / shadcn/ui styling.
9. Verify accessibility: keyboard navigation, ARIA roles.
