# OLS Frontend

Frontend React pour la plateforme **Odin La Science**.

## Stack

- **Runtime** : Vite 7 + React 19 + TypeScript (strict)
- **Styling** : Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **State** : Zustand (client), TanStack React Query (server)
- **Forms** : React Hook Form + Zod
- **Animations** : Framer Motion
- **Icons** : Lucide React
- **i18n** : react-i18next (FR/EN)
- **Tests** : Vitest + Testing Library

## Pre-requis

- Node.js 20+
- Backend OLS en cours d'execution (port 8080)

## Demarrage

```bash
npm install
npm run dev    # Dev server (port 3000, proxy /api vers :8080)
```

## Commandes

```bash
npm run dev              # Dev server
npm run build            # TypeScript check + Vite build
npm run lint             # ESLint (enforce i18n — pas de strings hardcoded)
npm run test             # Vitest (watch mode)
npm run test:coverage    # Vitest avec coverage V8
npm run i18n:extract     # Extraire les traductions vers en.json/fr.json
```

## Architecture

Architecture inspiree de VS Code : un **core** (shell IDE avec sidebar, tabs, panels, command palette, toolbar) et des **modules** qui s'y branchent via un contrat standardise `ModuleDefinition`.

Le core ne reference jamais un module par nom — il lit le registre central.

## i18n

Toujours utiliser `t('key')`, jamais de texte en dur. Apres ajout de cles : `npm run i18n:extract`.

## Documentation

- **Regles et conventions** : [CONVENTIONS.md](CONVENTIONS.md)
- **Guide de creation de module** : [module-creation-guide.md](../OLS-documentation/module-creation-guide.md)
