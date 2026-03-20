# Guide de création d’un module Atlas (Frontend)

Ce guide décrit la procédure à suivre pour ajouter un nouveau module Atlas dans le frontend React, en respectant la structure DRY et les bonnes pratiques du projet (ex : modules Bactériologie/Mycologie).

---

## 1. Arborescence type d’un module

```
src/features/<module>/
  api.ts
  components/
    <Entity>-detail.tsx
    index.ts
  config.tsx
  hooks.ts
  identification-config.ts
  index.ts
  page.tsx
  types.ts
```

## 2. Étapes de création

1. **Créer le dossier** `src/features/<module>/` et les fichiers listés ci-dessus.
2. **Définir les types** dans `types.ts` (interface principale, types d’enum, etc.).
3. **Créer la config** dans `config.tsx` (couleur, labels, colonnes, filtres, etc.).
4. **Définir les hooks** dans `hooks.ts` via le factory `createModuleHooks`.
5. **Configurer l’API** dans `api.ts` (appel backend, endpoints, etc.).
6. **Définir la config d’identification** dans `identification-config.ts` (sections, champs, options).
7. **Créer les composants** dans `components/` :
   - `<Entity>-detail.tsx` (vue détaillée)
   - `index.ts` (export + configuration des outils d’identification)
8. **Créer la page principale** dans `page.tsx` avec `createModulePage` (voir modules existants).
9. **Exporter le module** dans `index.ts` (page, hooks, types, etc.).
10. **Ajouter l’export** dans `src/features/index.ts` si besoin.

## 3. Points d’attention

- **Respecter la structure DRY** : factoriser au maximum, utiliser les factories (`createModulePage`, `createModuleHooks`, `createIdentificationTools`).
- **Internationalisation** : toutes les chaînes doivent passer par `t('...')`.
- **Personnalisation** : chaque module a sa couleur, ses labels, ses colonnes, ses filtres, etc.
- **Composants réutilisables** : utiliser les composants partagés (`DetailPanel`, `Badge`, etc.).
- **Tests** : prévoir des tests unitaires si possible.

## 4. Checklist d’intégration

- [ ] Types définis et exportés
- [ ] Config (couleur, labels, colonnes, filtres)
- [ ] Hooks créés et exportés
- [ ] API connectée
- [ ] Identification-config en place
- [ ] Composants (détail, outils d’identification)
- [ ] Page principale fonctionnelle
- [ ] Exports dans `index.ts`
- [ ] Ajout dans le routeur/pages si nécessaire
- [ ] Vérification i18n

## 5. Exemple minimal d’un module

Voir les modules `bacteriology` et `mycology` pour un exemple complet.

---

**Astuce** : Pour chaque nouveau module, dupliquer un module existant et adapter !

---

## 6. Exceptions

Ce guide ne s'applique **PAS** aux modules suivants qui nécessitent une implémentation spécifique :

1.  **Anatomie**
2.  **Animalerie**
3.  **Culture Cellulaire**

Pour tous les autres modules du prototype (Immunologie, Virologie, etc.), suivre la procédure standard décrite ci-dessus.

---

*Ce guide est à adapter selon l’évolution du projet.*
