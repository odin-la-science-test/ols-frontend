# Déploiement sur Vercel

Ce guide explique comment déployer l'application OLS Frontend sur Vercel.

## Prérequis

- Un compte Vercel (gratuit sur [vercel.com](https://vercel.com))
- Le CLI Vercel installé (optionnel) : `npm i -g vercel`
- Accès au backend API (pour la configuration des variables d'environnement)

## Configuration

### Variables d'environnement

Dans le dashboard Vercel, configurez les variables d'environnement suivantes :

1. **VITE_API_URL** : URL de votre backend API
   - Exemple : `https://api.votre-domaine.com`
   - Si non défini, l'app utilisera `/api` (proxy local en dev)

2. **VITE_APP_NAME** : Nom de l'application
   - Exemple : `OLS Lab`

### Configuration du proxy API

Le fichier `vercel.json` contient une configuration de réécriture pour le proxy API :

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://localhost:8080/api/:path*"
    }
  ]
}
```

**Important** : Modifiez la destination pour pointer vers votre backend en production. Vous avez deux options :

#### Option 1 : Utiliser VITE_API_URL (recommandé)
Supprimez la réécriture `/api/:path*` du `vercel.json` et définissez `VITE_API_URL` dans les variables d'environnement Vercel.

#### Option 2 : Proxy Vercel
Gardez la réécriture et modifiez la destination pour pointer vers votre backend :
```json
{
  "source": "/api/:path*",
  "destination": "https://votre-backend.com/api/:path*"
}
```

## Déploiement

### Méthode 1 : Via le Dashboard Vercel (recommandé)

1. Connectez-vous à [vercel.com](https://vercel.com)
2. Cliquez sur "Add New Project"
3. Importez votre repository GitHub/GitLab/Bitbucket
4. Vercel détectera automatiquement Vite
5. Configurez les variables d'environnement
6. Cliquez sur "Deploy"

### Méthode 2 : Via le CLI Vercel

```bash
# Installation du CLI (si pas déjà fait)
npm i -g vercel

# Connexion à Vercel
vercel login

# Déploiement
vercel

# Déploiement en production
vercel --prod
```

### Méthode 3 : Déploiement automatique

Une fois le projet connecté à Vercel :
- Chaque push sur la branche `main` déploie automatiquement en production
- Chaque push sur d'autres branches crée un déploiement de preview

## Configuration post-déploiement

### 1. Domaine personnalisé

Dans le dashboard Vercel :
1. Allez dans Settings > Domains
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions

### 2. Variables d'environnement

Dans Settings > Environment Variables :
- Ajoutez `VITE_API_URL` avec l'URL de votre backend
- Ajoutez `VITE_APP_NAME` si vous voulez personnaliser le nom

### 3. Build & Development Settings

Vérifiez que les paramètres sont corrects :
- **Framework Preset** : Vite
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

## Vérification

Après le déploiement, vérifiez :

1. ✅ L'application se charge correctement
2. ✅ Les routes fonctionnent (pas d'erreur 404 sur refresh)
3. ✅ Les appels API fonctionnent
4. ✅ L'authentification fonctionne
5. ✅ Les assets (images, fonts) se chargent

## Troubleshooting

### Erreur 404 sur les routes

Si vous obtenez des 404 en rafraîchissant une page :
- Vérifiez que `vercel.json` contient la réécriture vers `/index.html`

### Erreurs d'API

Si les appels API échouent :
- Vérifiez `VITE_API_URL` dans les variables d'environnement
- Vérifiez les CORS sur votre backend
- Vérifiez que le backend est accessible depuis Vercel

### Build échoue

Si le build échoue :
- Vérifiez les logs dans le dashboard Vercel
- Testez le build localement : `npm run build`
- Vérifiez que toutes les dépendances sont dans `package.json`

### Variables d'environnement non prises en compte

- Les variables doivent commencer par `VITE_` pour être accessibles côté client
- Redéployez après avoir modifié les variables d'environnement

## Performance

Vercel optimise automatiquement :
- ✅ Compression Gzip/Brotli
- ✅ Cache des assets statiques
- ✅ CDN global
- ✅ HTTP/2 et HTTP/3

Les headers de cache sont configurés dans `vercel.json` pour les assets.

## Monitoring

Utilisez le dashboard Vercel pour :
- Voir les analytics de trafic
- Monitorer les performances
- Consulter les logs de build et runtime
- Voir les erreurs côté client (avec Vercel Analytics)

## Rollback

En cas de problème, vous pouvez revenir à un déploiement précédent :
1. Allez dans l'onglet "Deployments"
2. Trouvez le déploiement stable
3. Cliquez sur les trois points > "Promote to Production"

## Support

- Documentation Vercel : https://vercel.com/docs
- Support Vercel : https://vercel.com/support
