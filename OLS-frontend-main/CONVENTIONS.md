# OLS Frontend — Conventions

Source de verite pour les regles et conventions obligatoires du frontend OLS. Pour les guides pratiques, tutoriels et catalogue de ressources, voir `OLS-documentation/`.

---

## Stack

- **Runtime** : Vite 7 + React 19 + TypeScript (strict)
- **Styling** : Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **State** : Zustand (client), TanStack React Query (server)
- **Forms** : React Hook Form + Zod
- **Animations** : Framer Motion
- **Dashboard Grid** : react-grid-layout v2 (drag, resize, responsive)
- **Icons** : Lucide React
- **i18n** : react-i18next
- **HTTP** : Axios
- **Routing** : React Router Dom
- **Charts** : Recharts via shadcn Charts

---

## Architecture

### Core / Module separation

Comme VS Code : le core fournit l'environnement (sidebar, panels, tabs, command palette, toolbar, etc.) et les modules y branchent du contenu via un contrat standardise `ModuleDefinition`.

**Regle fondamentale** : le core ne reference JAMAIS un module par nom. Il lit le registre central (`src/lib/module-registry/`).

**Ajouter un module = creer des fichiers dans `src/features/{module}/` + enregistrer dans `src/lib/module-registry/index.ts`.** Aucun autre fichier core a modifier.

### Structure des fichiers

```
src/
  api/                    -- Instance Axios, API factories (module-api-factory.ts)
  components/
    ui/                   -- Primitives shadcn/ui (Button, Card, Dialog, etc.)
    common/               -- Shell IDE (sidebar, tabs, command palette, breadcrumbs, etc.)
    modules/              -- Framework module (layouts, composants partages)
      layout/             -- CollectionLayout, SettingsLayout, module-header, etc.
      shared/             -- DataTable, FilterPanel, StatsBar, etc.
  features/{module}/      -- Implementations des modules
  hooks/                  -- Hooks partages + factories (create-module-hooks.ts)
  lib/
    module-registry/      -- Types ModuleDefinition + singleton registry
    logger.ts             -- Logger centralise
    accent-colors.ts      -- Couleurs d'accent par plateforme
    create-collection-page.tsx -- Factory page pour modules collection
  stores/                 -- Zustand stores (editor-groups, tabs, sidebar, panels, theme, etc.)
  i18n/                   -- Traductions (locales/en.json, locales/fr.json)
  router/                 -- Routes (generees dynamiquement depuis le registry)
```

### Patterns cles

| Pattern | Fichier | Description |
|---------|---------|-------------|
| Module Registry | `src/lib/module-registry/` | Singleton central, tous les composants shell le lisent |
| Module Definition | `src/features/{module}/definition.ts` | Contrat que chaque module implemente |
| Collection Factory | `src/lib/create-collection-page.tsx` | Genere une page complete pour tous les modules collection |
| Collection Layout | `src/components/modules/layout/collection-layout.tsx` | Layout unifie pour modules collection (table, cards, detail, filtres, editor) |
| Settings Layout | `src/components/modules/layout/settings-layout.tsx` | Layout pour pages formulaire/configuration avec TOC et recherche |
| API Factory | `src/api/module-api-factory.ts` | Genere les endpoints API standardises |
| Hooks Factory | `src/hooks/create-module-hooks.ts` | Genere les hooks React Query standardises |
| Logger | `src/lib/logger.ts` | Logging centralise (dev: console, prod: silencieux) |
| Entity Actions | `src/components/modules/shared/entity-actions-bar.tsx` | Barre d'actions en haut du detail panel (annotations, collections, favori/pin) |
| Pagination | `src/hooks/use-pagination.ts` | Hook de pagination client-side (PAGE_SIZE=50) |
| Offline Queue | `src/lib/offline-queue.ts` | File d'attente mutations hors-ligne |
| Presence (SSE) | `src/stores/online-users-store.ts` | Presence temps reel via SSE (rond vert sur avatars) |
| Optimistic Mutations | `src/hooks/use-optimistic-mutation.ts` | Hook generique pour mutations optimistes avec rollback automatique |
| Retry Feedback | `src/hooks/use-retry-feedback.ts` | Hook de retry avec feedback toast (utilise dans collection-layout error state) |
| Clipboard | `src/lib/clipboard.ts` | Utilitaire clipboard unifie — toujours utiliser `clipboard.copy()`, jamais `navigator.clipboard` directement |
| Smart Tips | `src/hooks/use-smart-tips.ts` | Tips conditionnels par module, declenches par comportement utilisateur |
| Progress Tracking | `src/stores/progress-store.ts` | Tracking local de progression (modules visites, entites creees) |

---

## Conventions generales

S'appliquent partout — aussi bien au core qu'aux modules.

1. **Taille des fichiers** — Max **~300 lignes** par fichier source. Au-dela, extraire les sous-composants, helpers et types dans des fichiers separes. Les stores Zustand cohesifs et les fichiers de test peuvent aller jusqu'a **~400 lignes**. Les fichiers generes (`schema.ts`) et de configuration pure (`theme-presets.ts`) sont exemptes.
2. **DRY** — Pas de duplication. Utiliser les factories et layouts partages.
3. **i18n** — Toutes les chaines via `t('key')`, jamais de texte en dur dans le JSX. ESLint l'enforce.
4. **i18n type safety** — Deux regles :
   - **Interdit** : construire des cles par interpolation `` t(`${prefix}.key`) ``. Utiliser des helper functions avec `switch` exhaustif a la place (cf. `types.ts` de chaque feature).
   - **Autorise** : passer des cles litterales via des objets de config (`labelKey: 'module.key'`), a condition que les cles soient ajoutees manuellement dans les JSON (`keepRemoved: true` empeche leur purge a l'extraction).
5. **TypeScript strict** — Pas de `any`. Typer tous les props et retours.
6. **Logger** — Utiliser `logger` depuis `@/lib/logger.ts`, jamais `console.*` directement.
7. **Search param** — Toujours `query` comme nom de parametre de recherche (pas `q` ou autre).
8. **Mobile-first** — Commencer par le mobile, etendre vers le desktop.
9. **Composants reutilisables** — Utiliser `@/components/ui` (primitives) et `@/components/modules/shared` (framework module).
10. **Path alias** — `@/` mappe vers `src/`.
11. **i18n extraction** — Executer `npm run i18n:extract` apres avoir ajoute des cles `t()`. Les cles statiques sont extraites automatiquement. Les cles passees par indirection (objets de config avec `labelKey`) doivent etre ajoutees manuellement dans les JSON — `keepRemoved: true` dans la config du parser garantit qu'elles ne seront pas purgees.
12. **Tests** — Objectif 100% de coverage. Chaque composant, hook et utilitaire doit etre teste. Commande : `npm run test:coverage`.
13. **Verification apres modification** — Avant de commit, toujours verifier : `npm run build` (TypeScript + Vite) et `npm run lint`. Ne jamais commit du code qui ne compile pas ou qui casse des tests existants.
14. **Error Boundary** — Chaque route module est wrappee par un `ErrorBoundary` dans le router. Pas besoin d'en ajouter manuellement.
15. **Permissions** — `useModuleAccessStore` gere l'acces aux modules. `filterAccessibleModules()` dans `registry.ts` filtre les modules par acces. Deja branche dans le hub, command palette, search et quick shortcuts.
16. **What's New** — `WhatsNewModal` dans `app-shell.tsx` s'affiche une fois par version. Contenu dans `whats-new-content.tsx`. Retrouvable dans Settings > About et command palette.

---

## Types generes depuis l'API

Les types correspondant aux enums backend sont generes depuis le schema OpenAPI. Source de verite unique : les enums Java.

- **Schema source** : `OLS-backend/openapi.json` (exporte depuis `/v3/api-docs`)
- **Types generes** : `src/api/generated/schema.ts` — NE PAS MODIFIER MANUELLEMENT
- **Re-exports** : `src/api/generated/enums.ts` — barrel file pour imports propres
- **Valeurs runtime** : `src/api/generated/enum-values.ts` — arrays `as const` pour Zod schemas + type-checks compile-time

### Workflow

1. Demarrer le backend
2. `npm run api:export` — exporte le schema OpenAPI
3. `npm run api:generate` — genere les types TypeScript
4. Committer `openapi.json` et `schema.ts`

### Regles

1. Les enums backend DOIVENT etre importes depuis `@/api/generated/enums`, jamais hardcodes en union type
2. Chaque `features/{module}/types.ts` re-exporte ses enums : `export type { GramStatus } from '@/api/generated/enums'`
3. Les Zod schemas utilisent les arrays de `@/api/generated/enum-values.ts`
4. Les types frontend-only (`BiochemKey`, types UI stores/registry) restent dans leurs fichiers respectifs
5. Apres modification d'un enum backend, re-executer le workflow ci-dessus

---

## Conventions Core

Quand on modifie le shell IDE (sidebar, panels, tabs, command palette, toolbar, stores, etc.).

- **Registry only** — Ne jamais referencer un module par nom dans le core. Utiliser `registry.getByRoute()`, `registry.getById()`, `registry.getBySegment()`, `registry.getSearchProviders()`, etc.
- **Labels / icones / routes** — Toujours depuis `ModuleDefinition`, jamais de maps hardcodees.
- **Nouveaux services plateforme** — Dans `src/lib/` (logique) ou `src/components/common/` (UI).
- **Stores** — Pattern `use{Domain}Store` (ex: `useThemeStore`, `useWorkspaceStore`), dans `src/stores/`.
- **Hooks partages** — Dans `src/hooks/`.
- **Factories pour modules** — Dans `src/hooks/create-*` ou `src/lib/create-*`.

---

## Conventions Module

Quand on cree ou modifie un module dans `src/features/{module}/`.

### Regle d'isolation

Un module ne touche JAMAIS aux fichiers core. Si tu dois modifier le core, c'est une amelioration de la plateforme, pas du module.

### Contrat obligatoire

Tout module DOIT avoir un `definition.ts` qui exporte un objet `ModuleDefinition` et etre enregistre dans `src/lib/module-registry/index.ts`.

Champs obligatoires de `ModuleDefinition` :
- `id` — identifiant unique frontend (ex: `'bacteriology'`)
- `moduleKey` — cle du catalogue backend (ex: `'MUNIN_BACTERIO'`), doit correspondre a `module_key` dans `data.sql`
- `translationKey` — cle i18n pour le titre (ex: `'bacteriology.title'`)
- `descriptionKey` — cle i18n pour la description hub (ex: `'bacteriology.description'`)
- `icon`, `accentColor`, `platform`, `route`

### Source de verite : registry vs catalogue

Le **frontend registry** (`definition.ts`) est la source de verite pour les metadonnees d'affichage (icon, route, titre, description). Le **backend catalogue** (`data.sql` / API `/api/modules`) est la source de verite pour la logique metier (prix, acces, verrouillage).

Le hook `useHubModules` merge les deux : pour un module implemente, il lit le registry ; pour un module non implemente, il fallback sur l'API. Les hub pages, mega-menus et menus utilisent ce hook — jamais `useModulesByType` directement.

### Vue admin (optionnelle)

Un module peut declarer une vue admin via `adminView` dans `ModuleDefinition`. Si l'utilisateur est ADMIN, le router rend automatiquement `adminView` au lieu de la vue user. Pas de route separee, pas de hub admin — c'est le meme module, la meme URL, mais une vue differente.

- `adminView?: LazyExoticComponent` — composant lazy-loaded de la vue admin
- Les pages admin (`admin-page.tsx`) vivent dans `features/{module}/`
- Le switch est automatique dans le router via `AdminViewSwitch`

### Tour guide (optionnel)

- `tour?: TourStep[]` — Steps pour la visite guidee du module. Chaque module peut contribuer des steps declenches automatiquement a la premiere visite. Les steps utilisent des attributs `data-tour="..."` comme selecteurs (stables, grep-ables). Cles i18n : `{module}.tour.{step}.title` / `{module}.tour.{step}.description`.

### Ce qui est automatique

Une fois `definition.ts` enregistre, le module obtient automatiquement :
- Route dans le router
- Navigation dans la command palette
- Label dans les breadcrumbs
- Raccourci dans le widget Quick Shortcuts du dashboard
- Apparition dans le hub Atlas/Lab correspondant (via `useHubModules`)
- Si `adminView` est present : vue admin affichee automatiquement pour les ADMIN
- Si `entityActions` est configure dans `createCollectionPage` : `EntityActionsBar` affichee en haut du detail panel (annotations, collections, favori/pin). Les actions CRUD (edit, delete) restent en bas via la prop `actions` de `DetailPanelContent`
- Lifecycle hooks (`onActivate`/`onDeactivate`) appeles automatiquement via `ModuleLifecycleWrapper` dans le router

Les autres integrations shell (status bar, menu bar, filtres, detail, recherche, commandes, widgets, etc.) sont opt-in — voir la section "Points d'extension shell" dans le [Guide de creation de module](../OLS-documentation/module-creation-guide.md#5-points-dextension-shell).

---

### Plateformes

Chaque module appartient a une plateforme qui determine son accent color et son background. Derive automatiquement de `PlatformProvider` — aucune prop a passer. D'autres plateformes peuvent etre ajoutees si necessaire (enrichir `PLATFORMS` dans `accent-colors.ts` + ajouter un `PlatformProvider` dans le router).

| Plateforme | Accent | Background | Exemples |
|------------|--------|------------|----------|
| Munin Atlas | Violet `hsl(262, 83%, 58%)` | `DotsBackground` | Bacteriologie, Mycologie |
| Hugin Lab | Emerald `hsl(160, 84%, 39%)` | `GridsBackground` | Contacts, Notes, QuickShare, Support, Organizations |
| Systeme | Neutre (`hsl(var(--foreground))`) | — | Settings, Profile, Home, Workspace |

Les pages systeme n'ont **pas de plateforme** (`PlatformProvider` absent) et utilisent un accent neutre derive de `--foreground`. Dans le shell (tab bar, status bar, activity bar, menu bar), les elements systeme n'affichent aucune couleur d'accent — ils restent en style neutre (muted/foreground). Cela distingue visuellement "je suis dans le shell" vs "je suis dans un module".

### Layouts

Tous les modules utilisent un des deux layouts actuels. D'autres layouts peuvent etre crees si un nouveau besoin ne rentre ni dans Collection ni dans Config. Le type d'architecture backend (Science, CRUD owned, Systeme) n'impacte pas le frontend — voir `OLS-backend/CONVENTIONS.md`.

| Layout | Factory / Composant | Quand l'utiliser | Exemples |
|--------|---------------------|------------------|----------|
| **Collection** | `createCollectionPage()` | Tout module avec une liste d'entites (table, cards, detail, filtres) | Bacteriologie, Contacts, QuickShare, Notifications |
| **Config** | `<SettingsLayout>` | Pages formulaire/configuration avec TOC et recherche | Settings, Profile |

**Options de `createCollectionPage`** (tout est optionnel sauf `columns` + `renderDetail`) :
- `renderEditor` — formulaire creation/edition
- `onItemClick` — callback au clic sur un item (drill-down au lieu d'ouvrir le detail)
- `identification` — onglet identification (modules science)
- `filters` — panneau de filtres
- `computeStats` — barre de statistiques
- `exportConfig` — export CSV
- `comparison` — comparaison d'entites
- `entityActions.renderFavoriteAction` — bouton favori/pin custom dans l'EntityActionsBar (pour modules avec toggle backend)

### Actions dans le detail panel — convention haut / bas

Le detail panel a **deux zones d'actions** avec des responsabilites distinctes :

| Zone | Composant | Contenu | Responsabilite |
|------|-----------|---------|----------------|
| **Haut** | `EntityActionsBar` | Annotations, Collections, Favori/Pin | Enrichissement de l'entite (transversal) |
| **Bas** | `DetailPanelContent` prop `actions` | Edit, Delete | CRUD specifique au module |

**Regles** :
- Le bouton favori/pin est **toujours en haut** (EntityActionsBar), jamais en bas
- Pour les modules avec un toggle backend (contacts, notes) : utiliser `entityActions.renderFavoriteAction` qui injecte un composant custom (`ContactFavoriteAction`, `NotePinAction`) dans le slot favori de l'EntityActionsBar
- Pour les modules sans backend favori (bacteriologie, mycologie) : utiliser `entityActions.favorite: true` qui rend le `FavoriteButton` store client par defaut
- Les actions du bas ne contiennent **que** Edit + Delete — pas de favori, pas de pin

### Pattern drill-down (collection → sous-collection)

Quand un module a des entites imbriquees (ex: Organisation → Membres), utiliser une child route qui rend un `CollectionLayout` avec `useParams()` pour recuperer l'ID parent :

```
/lab/organization         → liste des orgas (CollectionLayout, onItemClick → navigate)
/lab/organization/:id     → liste des membres (CollectionLayout, useParams pour orgId)
```

- La page parent utilise `onItemClick` pour naviguer vers la child route au lieu d'ouvrir le detail panel
- La child route est declaree dans `definition.ts` via `route.children`
- Le fil d'Ariane se construit automatiquement via le registry

**Reference** : `features/organization/` (page.tsx → components/members-page.tsx)

**References** : `features/bacteriology/` (collection Atlas), `features/contacts/` (collection Lab), `features/settings/` (config)

---

## Guide de creation d'un module

> **IMPORTANT** : Consulter le **[Guide complet de creation de module](../OLS-documentation/module-creation-guide.md)** dans le repo `OLS-documentation`. Ce guide contient le tutoriel step-by-step, les exemples de code, le catalogue exhaustif de toutes les ressources plateforme (composants, layouts, factories, stores, hooks, types), et les checklists. C'est la reference unique pour creer un nouveau module — le lire en entier avant de commencer.

---

## Reutilisation UI obligatoire

Les patterns visuels recurrents DOIVENT utiliser les composants partages de `@/components/modules/shared/` et `@/components/ui/`.

- **Interdit** : hardcoder des classes Tailwind pour un pattern qui existe deja en composant partage (empty state, loading skeleton, form field, detail section, etc.)
- **Interdit** : utiliser `<textarea>` HTML brut. Toujours utiliser `<Textarea>` de `@/components/ui` (spellcheck natif inclus). Pour les champs de texte long, ajouter `<AiCorrectionButton>` de `@/components/modules/shared` (correction IA via LanguageTool). Exception : champs techniques (JSON, code) avec `spellCheck={false}`.
- **Interdit** : utiliser l'attribut HTML `title` pour les tooltips. Toujours utiliser `<Tooltip>` / `<TooltipTrigger>` / `<TooltipContent>` de `@/components/ui` (ou `<IconButtonWithTooltip>` pour les boutons icones). `delayDuration={200}` est le standard.
- **Interdit** : utiliser `navigator.clipboard.writeText()` directement. Toujours utiliser `clipboard.copy()` de `@/lib/clipboard.ts`
- `EntityActionsBar` pour les actions d'enrichissement en haut du detail panel (annotations, collections, favori/pin)
- `AnnotationPanel` pour les annotations inline
- `AddToCollectionDialog` pour ajouter a une collection
- `FavoriteButton` pour le toggle favori (store client, modules science). Pour les modules avec toggle backend, utiliser `renderFavoriteAction` dans `entityActions`
- **Si le composant n'existe pas** : le creer dans `shared/`, le documenter dans le [guide de creation de module](../OLS-documentation/module-creation-guide.md) S6, puis l'utiliser
- **Reference** : catalogue complet dans `OLS-documentation/module-creation-guide.md` S6

---

## Conventions de nommage

| Element | Convention | Exemple |
|---------|------------|---------|
| Dossier module | kebab-case | `features/my-module/` |
| Fichiers | kebab-case | `my-entity-detail.tsx` |
| Composants React | PascalCase | `MyEntityDetail` |
| Hooks | `use` prefix | `useMyEntities` |
| Stores | `use{Domain}Store` | `useThemeStore` |
| Factories | `create{Thing}` | `createCollectionPage` |
| Types / Interfaces | PascalCase | `ModuleDefinition`, `CreateContactRequest` |
| Constantes | UPPER_SNAKE_CASE | `MUNIN_PRIMARY` |
| Cles i18n | `module.key` | `contacts.title`, `contacts.searchPlaceholder` |
| Endpoint backend | `/api/{module}` | `/api/contacts` |

---

## Design Direction

Style professionnel SaaS. Subtil, elegant, clean. Pas d'effets flashy.

### Identite visuelle

**Munin Atlas** (catalogue + modules Atlas) :
- Primary : violet `hsl(262, 83%, 58%)`
- Accent : purple `hsl(280, 70%, 50%)`

**Hugin Lab** (catalogue + modules Lab) :
- Primary : emerald `hsl(160, 84%, 39%)`
- Accent : teal `hsl(160, 70%, 55%)`

**Systeme** (Settings, Profile, Home, Workspace) :
- Accent : neutre `hsl(var(--foreground))` — pas de couleur de module
- Dans le shell (tab bar, status bar, etc.) : elements neutres (muted/foreground), pas de trait colore

Dark mode first.

### Style visuel

- Bordures fines (1px, `border/30-50` opacite)
- Effets glass via les **utility tiers** (voir ci-dessous)
- Ombres minimales
- Transitions smooth (300ms ease-out)
- Animations presentes mais subtiles

### Glass tiers (DRY)

Les effets glassmorphism sont definis comme `@utility` dans `index.css`. **Ne jamais ecrire `bg-{token}/XX backdrop-blur-*` en inline** — utiliser le tier correspondant.

| Utility | Rendu | Usage |
|---------|-------|-------|
| `glass-overlay` | `card/80 blur(32px) saturate(1.3) + inset highlight` | Popovers, menus, dropdowns, panels, overlays |
| `glass-card` | `card/70 blur(32px) saturate(1.3) + inset highlight` | Cards surelevees (auth forms, modal cards) |
| `glass-surface` | `card/50 blur(12px) saturate(1.2)` | Widgets, sidebars, conteneurs legers |
| `glass-chrome` | `card/80 blur(12px) saturate(1.2)` | Shell chrome : menu bar, status bar, breadcrumbs |
| `glass-subtle` | `card/30 blur(8px)` | Fonds tres legers (content areas) |
| `glass-popover` | `popover blur(32px) saturate(1.3) + inset highlight` | Context menus, menu primitives (token `--popover`) |
| `glass-popover-dense` | `popover/95 blur(32px) saturate(1.3)` | Tooltips, corrections IA, sidebar tooltips |
| `glass-frosted` | `background/80 blur(4px)` | Boutons outline, checkboxes, overlay modals |
| `glass-muted` | `muted/40 blur(4px)` | Widget handles, petits boutons interactifs |
| `scrim-heavy` | `black/60 blur(4px)` | Modals plein ecran (session limit) |
| `scrim` | `black/40 blur(4px)` | Drawers, menus mobiles |
| `scrim-light` | `black/20 blur(4px)` | Overlays subtils (sidebar peek) |

**Exceptions inline autorisees** : couleurs thematiques (banners colores type `bg-blue-500/10`), `backdrop-blur-sm` seul comme modificateur Tailwind (boutons flottants).

### Composants

- Button variants : `default`, `gradient`, `glass`, `outline`, `ghost`, `link`
- Card variants : `default`, `glass`, `elevated`, `outline`
- Icons : `<Icon className="w-5 h-5" strokeWidth={1.5} />`

### Couleur d'accent — usage strict

La couleur d'accent (`--module-accent` / `primary`) sert **uniquement a indiquer un etat** : element selectionne, actif, ou en cours. C'est ce qui garde l'interface subtile, minimaliste et lisible.

**Ou utiliser l'accent** :
- Indicateurs actifs (TOC sidebar, status bar label) : `text-[var(--module-accent)]` ou `bg-[var(--module-accent)]`
- Boutons d'action primaires (submit, CTA) : `bg-[var(--module-accent)] text-white`
- Focus rings : via `--color-ring` (automatique)
- Checks de selection dans menus : `text-[var(--module-accent)]`

**Ou ne PAS utiliser l'accent** :
- Decoration pure (bordures, backgrounds, icones statiques)
- Texte courant ou labels
- Badges informatifs non-interactifs
- Chips/boutons de selection (utiliser le style segmented, voir ci-dessous)

**Pages systeme** : `--module-accent` vaut `hsl(var(--foreground))` (neutre). Les selections et toggles restent visibles mais sans couleur de marque.

### Chips de selection — style segmented (DRY)

Les boutons de selection/filtre utilisent un style **segmented** : fond plein quand selectionne, texte nu sinon. Defini comme `@utility` dans `index.css` :

```tsx
<button className={cn('chip-base px-2.5 py-1 text-xs', selected ? 'chip-active' : 'chip-inactive')}>
```

| Utility | Rendu |
|---------|-------|
| `chip-base` | `inline-flex items-center rounded-md font-medium transition-all` |
| `chip-active` | `bg-primary text-primary-foreground shadow-sm` |
| `chip-inactive` | `text-muted-foreground hover:text-foreground` |

Pour les variants colorees (identification), `ToggleButton` supporte `variant="positive"` (violet) et `variant="negative"` (pink).

**Ne jamais re-definir ces classes en inline** — utiliser les utilities.

### Toggles switch

- Toggle ON (pages systeme) : `bg-foreground/60` (neutre, visible sur tous les themes)
- Toggle ON (pages module) : `bg-[var(--module-accent)]`
- Toggle OFF : `bg-border`

### Couleur dans le shell — deux regles distinctes

Les elements du shell utilisent la couleur d'accent de deux facons differentes selon leur nature :

| Type d'element | Regle | Source | Exemples |
|----------------|-------|--------|----------|
| **Indicateur de navigation** — "ou je suis" | Suit le module **actif** (change quand on navigue) ; neutre sur pages systeme | `getAccentForPath(path)` → `string \| null` | Tab active, status bar stripe, activity bar dot de selection |
| **Element possede par un module** — "a qui j'appartiens" | Couleur **intrinseque** du module qui l'a enregistre ; toujours la meme | `accentColor` passe au store lors du `register()` | Menu bar "Atlas" = violet, bottom panel "Gram Overview" = violet, "Activite" = neutre |

**Indicateurs de navigation** : `getAccentForPath()` retourne `null` pour les routes systeme → le composant utilise les utilities `neutral-*` (voir section suivante) au lieu d'un trait colore.

**Elements possedes** : la couleur est fixee a l'enregistrement (`registerTab({ accentColor })`, `accentColor={MUNIN_PRIMARY}`) et ne change pas selon la navigation. Un panneau systeme (Activite, Historique) n'a pas de couleur d'accent.

### Couleurs neutres (pages systeme)

Quand `getAccentForPath()` retourne `null` (pages systeme) ou pour les composants system-only (`features/settings/`, `features/profile/`), utiliser les `@utility neutral-*` definis dans `index.css`. Source de verite unique — **ne jamais hardcoder d'opacites foreground dans le JSX**.

**Indicateurs** (barres, dots, badges, borders) :

| Utility | Usage |
|---------|-------|
| `neutral-indicator` | Barres actives 2px (activity bar, status bar stripe, TOC sidebar) |
| `neutral-dot` | Dots de selection (stacked, split, explorer, mobile) |
| `neutral-border` | Bordures actives (preset card, keybinding row, profile card) |
| `neutral-ring` | Rings actifs (avatar picker) |
| `neutral-check` | Icones check/actif (preset card, density option) |
| `neutral-text` | Texte d'etat customise (keybinding row) |

**Fonds** :

| Utility | Usage |
|---------|-------|
| `neutral-bg-subtle` | Fond actif subtil (cards actives, recording state) |
| `neutral-bg-badge` | Fond badge textuel (badge "Actif" dans profile card) |
| `bg-muted` | Fond selectionne (onglet actif, item actif) — token Tailwind standard |
| `bg-muted/50` | Fond hover — token Tailwind standard |

**Regle** : les composants dans `features/settings/` et `features/profile/` sont system-only. Ils utilisent les utilities `neutral-*` directement, pas `--module-accent`.

---

## Backgrounds (Aceternity UI)

| Background | Usage |
|------------|-------|
| `<SparklesBackground />` | Landing page (`/`), 404, pages d'erreur |
| `<Sparkles density="subtle" />` | Login (`/login`), Register (`/register`) |
| `<DotsBackground />` | Munin Atlas catalogue (`/atlas`), modules Atlas |
| `<GridsBackground />` | Hugin Lab catalogue (`/lab`), modules Lab, dashboards, settings, tables, formulaires |

---

## Don'ts

- Ombres lourdes
- Emojis comme icones
- Texte en dur (hardcoded)
- Animations excessives
- `bg-background` sur les pages avec ElegantBackground/SubtleBackground
- `console.*` (utiliser le logger)
- Hardcoder des noms de modules dans les fichiers core (utiliser le registry)
- Cles i18n par interpolation `` t(`${prefix}.key`) `` (utiliser des helpers avec `switch`)
- `title=` HTML pour les tooltips (utiliser `<Tooltip>` de `@/components/ui`)
