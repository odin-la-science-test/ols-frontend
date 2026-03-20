# OLS Frontend - Copilot Instructions

## Stack
- Vite + React 18 + TypeScript (strict)
- Tailwind CSS v4 + Shadcn/ui
- Zustand (client state), TanStack Query (server state)
- React Hook Form + Zod (validation)
- Framer Motion (animations)
- Lucide React (icons)
- react-i18next (translations)
- Axios (HTTP)
- React Router Dom (routing)
- Recharts via Shadcn Charts (data viz)

## Core Rules
1. **DRY** - No code duplication
2. **Mobile-first** - Start with mobile, scale up
3. **i18n** - All text via `t('key')`, no hardcoded strings
4. **Reuse** - Use existing components from `@/components/ui` and `@/components/common`
5. **TypeScript** - Strict types, no `any`
6. **i18n Type Safety** - Use explicit keys `t('module.key')`, NEVER dynamic `t(\`${prefix}.key\`)` (breaks TypeScript validation & i18n extraction)

## Backgrounds (Aceternity UI)
Use the appropriate background based on page type:

### `<SparklesBackground />` - Landing & Error pages
For the home page and error pages:
- Home/Landing (`/`)
- 404 Not Found
- Error pages

### `<Sparkles density="subtle" />` - Authentication pages
For login and registration:
- Login (`/login`)
- Register (`/register`)

### `<DotsBackground />` - Munin Atlas & Modules
For Munin Atlas catalog and its associated modules:
- Munin Atlas catalog (`/atlas`)
- Module content pages from Munin (bacteriology, mycology, etc.)

### `<GridsBackground />` - Hugin Lab & Modules
For Hugin Lab catalog and its associated modules:
- Hugin Lab catalog (`/lab`)
- Module content pages from Hugin Lab
- Auto-included in `ModuleLayout` for Hugin modules
- Dashboards
- Settings
- User management
- Data tables and forms

## Design Direction
Professional SaaS style. Subtle, elegant, clean. No flashy effects.

### Identity
**Munin Atlas** (catalog + all Atlas modules):
- **Primary**: violet `hsl(262, 83%, 58%)`
- **Accent**: purple `hsl(280, 70%, 50%)`

**Hugin Lab** (catalog + all Lab modules):
- **Primary**: emerald `hsl(160, 84%, 39%)`
- **Accent**: teal `hsl(160, 70%, 55%)`

- Dark mode first

### Visual Style
- Fine borders (1px, `border/30-50` opacity)
- Subtle glass effects (`bg-card/50 backdrop-blur-xl`)
- Minimal shadows
- Smooth transitions (300ms ease-out)
- Animations present but subtle

### Components
- Button variants: `default`, `gradient`, `glass`, `outline`, `ghost`, `link`
- Card variants: `default`, `glass`, `elevated`, `outline`
- Icons: `<Icon className="w-5 h-5" strokeWidth={1.5} />`

## Don'ts
- Heavy shadows
- Emojis as icons
- Hardcoded text
- Excessive animations
- `bg-background` on pages using ElegantBackground/SubtleBackground
