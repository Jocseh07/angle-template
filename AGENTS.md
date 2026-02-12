# Angle Template

A React SPA template built with TanStack Router, TanStack Query, shadcn/ui, and Tailwind CSS v4.

## Tech Stack

- **Runtime:** React 19 with React Compiler (via `babel-plugin-react-compiler`)
- **Bundler:** Vite 7
- **Routing:** TanStack Router (file-based routing with auto code splitting)
- **Data Fetching:** TanStack Query
- **Styling:** Tailwind CSS v4 with CSS variables for theming
- **UI Components:** shadcn/ui (New York style, Zinc base color, Lucide icons)
- **Forms:** React Hook Form + Zod validation
- **Animations:** Motion (motion/react)
- **Linting/Formatting:** Biome (tabs, double quotes)
- **Type Checking:** TypeScript strict mode (`tsgo --noEmit`)
- **Testing:** Vitest + Testing Library

## Project Structure

```
src/
├── components/
│   ├── common/           # Shared app-level components
│   │   ├── theme-provider.tsx    # Dark/light/system theme context
│   │   ├── mode-toggle.tsx       # Theme switcher dropdown
│   │   ├── root-provider.tsx     # TanStack Query provider + context
│   │   ├── devtools.tsx          # TanStack Query devtools panel
│   │   ├── error-page.tsx        # Default error boundary component
│   │   ├── not-found-page.tsx    # Default 404 component
│   │   └── copy.tsx              # Copy-to-clipboard button
│   └── ui/               # shadcn/ui primitives (do not edit manually)
├── hooks/                 # Shared custom hooks
├── lib/                   # Shared utilities (cn, etc.)
├── routes/                # TanStack Router file-based routes
│   ├── __root.tsx         # Root route (layout wrapper, Outlet)
│   └── index.tsx          # Home page (/)
├── styles.css             # Global styles + CSS theme variables
├── main.tsx               # App entry point, router + providers setup
├── routeTree.gen.ts       # Auto-generated route tree (do not edit)
└── reportWebVitals.ts     # Web Vitals reporting
```

## Routing Conventions (TanStack Router)

This project uses **file-based routing** with the TanStack Router Vite plugin. Routes are auto-discovered from `src/routes/` and the route tree is generated into `src/routeTree.gen.ts`.

### File Naming

| Pattern | Purpose |
|---|---|
| `__root.tsx` | Root layout route, wraps all routes via `<Outlet />` |
| `index.tsx` | Index route for a path segment (e.g., `routes/index.tsx` = `/`) |
| `about.tsx` | Static route (`/about`) |
| `posts/index.tsx` | Nested index (`/posts`) |
| `posts/$postId.tsx` | Dynamic param (`/posts/:postId`) |
| `_layout.tsx` | Pathless layout (wraps children without adding a URL segment) |
| `route_.escaped.tsx` | Non-nested route (the `_` suffix breaks out of parent nesting) |
| `.` separator | Flat nesting (`posts.new.tsx` = child of `/posts` at `/posts/new`) |

### Route Component Colocation with `-components/`

Files and folders prefixed with `-` are **excluded from the route tree**. Use this to colocate page-specific components directly alongside their route files:

```
src/routes/
├── dashboard/
│   ├── index.tsx              # Route: /dashboard
│   ├── -components/           # Ignored by router, holds page components
│   │   ├── stats-card.tsx
│   │   ├── recent-activity.tsx
│   │   └── sidebar-nav.tsx
│   ├── settings.tsx           # Route: /dashboard/settings
│   └── settings/
│       └── -components/       # Components specific to /dashboard/settings
│           ├── settings-form.tsx
│           └── profile-section.tsx
├── posts/
│   ├── index.tsx              # Route: /posts
│   ├── -components/           # Shared components for /posts routes
│   │   ├── post-card.tsx
│   │   └── post-filters.tsx
│   ├── $postId.tsx            # Route: /posts/:postId
│   └── $postId/
│       └── -components/       # Components for /posts/:postId
│           ├── post-content.tsx
│           └── comment-section.tsx
```

**Rules:**
- Every route that needs supporting components gets a sibling `-components/` directory.
- The `-` prefix tells TanStack Router to ignore these files and folders entirely.
- Import from `-components/` using relative paths within the route file: `import { StatsCard } from "./-components/stats-card"`.
- Components shared across **multiple routes** go in `src/components/common/`.
- Components shared across **the entire app** (UI primitives) live in `src/components/ui/`.

### Route Configuration

Each route file exports a `Route` created via `createFileRoute`:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/some-path")({
  component: SomePage,
  // loader, beforeLoad, errorComponent, pendingComponent, etc.
});

function SomePage() {
  return <div>...</div>;
}
```

The root route uses `createRootRouteWithContext` to inject the TanStack Query client into the router context, making it available to all route loaders:

```tsx
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => <Outlet />,
});
```

### Auto Code Splitting

The Vite plugin is configured with `autoCodeSplitting: true`. This means route components, loaders, and other route config are automatically code-split without needing `.lazy.tsx` files.

### Router Options

Configured in `src/main.tsx`:

- `defaultPreload: "intent"` - Preloads routes on hover/focus intent.
- `scrollRestoration: true` - Restores scroll position on navigation.
- `defaultStructuralSharing: true` - Optimizes re-renders with structural sharing.
- `defaultPreloadStaleTime: 0` - Always preloads fresh data.
- `defaultErrorComponent` - Uses `ErrorPage` from `src/components/common/error-page.tsx`.
- `defaultNotFoundComponent` - Uses `NotFoundPage` from `src/components/common/not-found-page.tsx`.

## Data Fetching Patterns (TanStack Query)

TanStack Query is integrated at the router level. The `QueryClient` is passed through router context.

**Guidelines:**
- Use **route loaders** for data required by the entire page. Access `queryClient` from context to call `ensureQueryData`.
- Use **suspense queries** (`useSuspenseQuery`) for data needed by individual components. This lets TanStack Router handle loading/error states via Suspense boundaries.
- Keep query keys and query functions in dedicated files (e.g., `src/routes/posts/-components/queries.ts` or `src/lib/queries/`).

```tsx
// In a route loader
export const Route = createFileRoute("/posts")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQueryOptions()),
  component: PostsPage,
});
```

## Theming (Dark Mode / Light Mode)

### How It Works

Theme support is implemented via a custom `ThemeProvider` in `src/components/common/theme-provider.tsx` that manages a `dark` | `light` | `system` state:

1. Theme preference is persisted to `localStorage` under the key `vite-ui-theme`.
2. The provider adds/removes `dark` or `light` class on the `<html>` element.
3. When set to `system`, it reads `prefers-color-scheme` media query.
4. All shadcn/ui components automatically respond to the class change via Tailwind's `dark:` variant.

### CSS Variables

Theme colors are defined in `src/styles.css` using CSS custom properties under `:root` (light) and `.dark` (dark). The Tailwind `@theme inline` block maps these to Tailwind color utilities.

The base color palette is **Zinc** with oklch color values.

### Using the Theme

```tsx
import { useTheme } from "@/components/common/theme-provider";

function MyComponent() {
  const { theme, setTheme } = useTheme();
  // theme: "dark" | "light" | "system"
  // setTheme("dark") / setTheme("light") / setTheme("system")
}
```

The `ModeToggle` component (`src/components/common/mode-toggle.tsx`) provides a ready-made dropdown with Light / Dark / System options using shadcn's `DropdownMenu`.

### Tailwind Dark Mode Classes

The dark mode variant is configured in `src/styles.css`:

```css
@custom-variant dark (&:is(.dark *));
```

Use `dark:` prefix in Tailwind classes:

```tsx
<div className="bg-white dark:bg-zinc-900 text-black dark:text-white">
```

Prefer using the semantic CSS variable-based colors (`bg-background`, `text-foreground`, `bg-card`, etc.) which automatically switch between light and dark themes.

## shadcn/ui Components

### Configuration

Defined in `components.json`:

- **Style:** `new-york`
- **Base color:** `zinc`
- **CSS variables:** enabled
- **Icon library:** `lucide`
- **RSC:** `false` (this is a client-side SPA)

### Path Aliases

| Alias | Path |
|---|---|
| `@/components` | `src/components` |
| `@/components/ui` | `src/components/ui` |
| `@/lib` | `src/lib` |
| `@/hooks` | `src/hooks` |

### Adding New Components

```bash
pnpm dlx shadcn@latest add <component-name>
```

Components are installed to `src/components/ui/`. Do not manually edit these files unless necessary. The `cn()` utility from `@/lib/utils` is used for conditional class merging (clsx + tailwind-merge).

### Available Components

Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge, Breadcrumb, Button, Button Group, Calendar, Card, Carousel, Chart (Recharts), Checkbox, Collapsible, Command, Context Menu, Dialog, Drawer, Dropdown Menu, Empty, Field, Form, Hover Card, Input, Input Group, Input OTP, Item, Kbd, Label, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner (Toasts), Spinner, Switch, Table, Tabs, Textarea, Toggle, Toggle Group, Tooltip.

## Linting and Formatting (Biome)

Biome is used for both linting and formatting.

- **Indent:** Tabs
- **Quotes:** Double quotes
- **Rules:** Recommended ruleset enabled
- Biome ignores `src/routeTree.gen.ts` and `src/styles.css`.
- `src/components/ui/**` has relaxed a11y and correctness rules (shadcn components come as-is).

### Commands

```bash
pnpm check     # Run Biome check (lint + format validation)
pnpm lint      # Run Biome lint only
pnpm format    # Run Biome format only
pnpm typecheck # Run TypeScript type checking (tsgo --noEmit)
```

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start dev server on port 3000 |
| `pnpm build` | Production build (Vite + tsc) |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests with Vitest |
| `pnpm check` | Biome lint + format check |
| `pnpm typecheck` | TypeScript type checking |

## Provider Hierarchy

The app wraps providers in this order (outermost to innermost):

1. `<React.StrictMode>` - Development checks
2. `<TanStackQueryProvider.Provider>` - QueryClient for data fetching
3. `<RouterProvider>` - TanStack Router
4. Router `Wrap` component:
   - `<ThemeProvider>` - Dark/light mode management
   - `<Toaster>` - Sonner toast notifications (top-center, rich colors)
5. `<Outlet />` - Route content renders here

## Conventions Summary

- Use **file-based routing**. Never manually edit `routeTree.gen.ts`.
- Colocate page components in `-components/` folders next to route files.
- Shared components go in `src/components/common/`.
- UI primitives live in `src/components/ui/` (managed by shadcn CLI).
- Use `@/` path alias for all imports from `src/`.
- Use semantic theme colors (`bg-background`, `text-foreground`, `bg-primary`, etc.) instead of raw Tailwind color values to support light/dark mode.
- Use `cn()` from `@/lib/utils` for conditional class names.
- Use Biome for formatting (tabs, double quotes). Run `pnpm check` before committing.
- Use React Compiler optimizations (no manual `useMemo`/`useCallback` unless profiling indicates need).
