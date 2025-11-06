# Sprint 9 : Admin & modération ✅

## Fonctionnalités implémentées

### ✅ US014 : Dashboard admin
- Vue d'ensemble avec KPI clés
- Statistiques en temps réel
- Accès rapide aux sections de modération

### ✅ US015 : Modération des annonces et utilisateurs
- Liste de toutes les annonces avec filtres
- Suppression d'annonces (soft delete)
- Liste de tous les utilisateurs avec statistiques
- Suspension/Activation d'utilisateurs
- Recherche par nom, email, username

## Pages créées

1. **`/admin`** - Dashboard avec KPI
2. **`/admin/listings`** - Gestion des annonces
3. **`/admin/users`** - Gestion des utilisateurs

## API Routes créées

1. **`GET /api/admin/stats`** - Statistiques pour le dashboard
2. **`GET /api/admin/listings`** - Liste de toutes les annonces
3. **`DELETE /api/admin/listings`** - Supprimer une annonce (admin)
4. **`GET /api/admin/users`** - Liste de tous les utilisateurs
5. **`PATCH /api/admin/users`** - Suspendre/Activer un utilisateur

## KPI affichés

- **Utilisateurs** : Nombre total d'utilisateurs
- **Annonces actives** : Nombre d'annonces actives et vendues
- **Commandes** : Nombre total et complétées
- **Chiffre d'affaires** : Total des commandes avec paiement libéré
- **Litiges** : Nombre de commandes en litige

## Fonctionnalités de sécurité

- ✅ Vérification du rôle ADMIN sur toutes les routes
- ✅ Protection des routes API avec vérification de session
- ✅ Redirection automatique si non-admin
- ✅ Impossible de suspendre un autre admin

## Utilisation

### Promouvoir un utilisateur en admin

```bash
pnpm admin:promote <email>
```

Exemple :
```bash
pnpm admin:promote admin@balkanwear.com
```

### Accès au dashboard

1. Connectez-vous avec un compte admin
2. Cliquez sur "Admin" dans le header
3. Vous accédez au dashboard avec tous les KPI

## Améliorations futures

- [ ] Système de signalement d'annonces/utilisateurs
- [ ] Modération de contenu (filtres automatiques)
- [ ] Logs d'actions admin
- [ ] Export de données (CSV, Excel)
- [ ] Graphiques et analytics avancés
- [ ] Gestion des catégories
- [ ] Configuration de la plateforme
- [ ] Notifications admin pour litiges

## Notes techniques

- Le rôle ADMIN est stocké dans le champ `role` de la table User
- Les utilisateurs suspendus ont le rôle "SUSPENDED"
- Le soft delete est utilisé pour les annonces (statut DELETED)
- Les statistiques sont calculées en temps réel
- Le dashboard se rafraîchit automatiquement toutes les 30 secondes

