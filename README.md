# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## 🌍 Internationalisation (i18n)

Ce projet utilise `i18next` pour la gestion des traductions. Le flux de travail est automatisé pour éviter les erreurs manuelles.

### 1. Ajouter du texte
Dans vos composants React, n'utilisez jamais de texte en dur. Utilisez le hook `useTranslation` :

```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('module.title')}</h1>;  // ✅ Correct
  // return <h1>Titre du module</h1>;   // ❌ Incorrect (Linter warning)
}
```

### 2. Extraire les traductions
Ne modifiez pas les fichiers JSON manuellement pour ajouter des clés. Laissez le script le faire pour vous :

```bash
npm run i18n:extract
```

Cette commande va :
- Scanner tout le dossier `src/`
- Extraire toutes les clés `t('...')` et `tFunc('...')`
- Mettre à jour `src/i18n/locales/en.json` et `fr.json`
- **Supprimer** les clés qui ne sont plus utilisées dans le code (n'ayez pas peur, c'est pour garder propre)
- Trier les clés par ordre alphabétique (évite les doublons)

### 3. Vérifier la qualité (Linting)
Le projet est configuré pour interdire le texte en dur dans le JSX. Pour vérifier si vous avez oublié des traductions :

```bash
npm run lint
```
Tout texte non traduit sera signalé comme une erreur/warning.
