# Shadcn UI Components

This project utilizes @shadcn/ui for its user interface components. These are beautifully designed, accessible components that can be customized to fit your application.

## Locating Installed Components

Components are available in the `src/components/ui` folder, according to the aliases from the `components.json` file.

## Using a Component

Import the component according to the configured `@/` alias.

```tsx
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
```

Example usage of components:

```tsx
<Button variant="outline">Click me</Button>

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
```

## Installing Additional Components

Many other components are available, but are not currently installed. A complete list can be found at https://ui.shadcn.com/r

To install a new component, use the shadcn CLI.

```bash
npx shadcn@latest add [component-name]
```

For example, to add the accordion component:

```bash
npx shadcn@latest add accordion
```

Important: `npx shadcn-ui@latest` is deprecated, use `npx shadcn@latest`

Some popular components include:

- Accordion
- Alert
- AlertDialog
- AspectRatio
- Avatar
- Calendar
- Checkbox
- Collapsible
- Command
- ContextMenu
- DataTable
- DatePicker
- Dropdown Menu
- Form
- Hover Card
- Menubar
- Navigation Menu
- Popover
- Progress
- Radio Group
- ScrollArea
- Select
- Separator
- Sheet
- Skeleton
- Slider
- Switch
- Table
- Textarea
- Sonner (previously Toast)
- Toggle
- Tooltip

## Component Styling

This project utilizes the "new-york" style variant with a "neutral" base color and CSS variables for theming, as configured in the `components.json` section.
