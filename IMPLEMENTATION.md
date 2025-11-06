# État d'implémentation - BalkanWear MVP

## ✅ Sprint 1-2 : Authentification & Profil utilisateur (TERMINÉ)

### Fonctionnalités implémentées

#### Authentification
- ✅ **US001** : Création de compte avec email/mot de passe
- ✅ **US001** : Authentification OAuth Google (structure prête)
- ✅ **US002** : Connexion/Déconnexion
- ✅ **US004** : Réinitialisation de mot de passe (structure API, email à implémenter)

#### Profil utilisateur
- ✅ **US003** : Ajout/modification de photo de profil (URL)
- ✅ **US003** : Ajout/modification de pseudonyme
- ✅ **US003** : Ajout/modification de ville

### Structure technique

#### Base de données (Prisma)
- ✅ Schéma complet avec tous les modèles nécessaires
- ✅ Relations entre User, Listing, Order, Message, Conversation, Review
- ✅ Support SQLite pour le développement
- ✅ Prêt pour migration vers PostgreSQL en production

#### Authentification (NextAuth.js)
- ✅ Configuration complète avec Credentials et Google providers
- ✅ Adapter Prisma pour la persistance
- ✅ Sessions JWT
- ✅ Protection des routes API

#### Composants UI
- ✅ Button (variants: primary, secondary, outline, ghost)
- ✅ Input (avec label et gestion d'erreurs)
- ✅ Design system de base avec Tailwind CSS

#### Pages
- ✅ Page d'accueil (landing)
- ✅ Connexion (`/auth/signin`)
- ✅ Inscription (`/auth/signup`)
- ✅ Mot de passe oublié (`/auth/forgot-password`)
- ✅ Profil utilisateur (`/profile`)

#### API Routes
- ✅ `/api/auth/[...nextauth]` - Authentification NextAuth
- ✅ `/api/auth/register` - Inscription
- ✅ `/api/auth/forgot-password` - Réinitialisation (structure)
- ✅ `/api/profile` - GET/PATCH profil utilisateur

## ⏳ Prochaines étapes

### Sprint 3-4 : Création et affichage d'annonces

À implémenter :
- [ ] **US005** : Création d'annonce avec photos, titre, description, prix, catégorie
- [ ] **US006** : Affichage des annonces récentes et populaires
- [ ] **US007** : Filtres (taille, marque, prix, état)
- [ ] **US008** : Modification/suppression d'annonces

Fichiers à créer :
- `app/listings/page.tsx` - Liste des annonces
- `app/listings/new/page.tsx` - Création d'annonce
- `app/listings/[id]/page.tsx` - Détail d'une annonce
- `app/listings/[id]/edit/page.tsx` - Édition d'annonce
- `app/api/listings/route.ts` - CRUD API pour les annonces
- `components/ListingCard.tsx` - Carte d'annonce
- `components/ListingForm.tsx` - Formulaire d'annonce
- `components/FilterBar.tsx` - Barre de filtres

### Sprint 5-6 : Messagerie et notifications

À implémenter :
- [ ] **US009** : Messagerie en temps réel
- [ ] **US010** : Notifications push

### Sprint 7-8 : Paiements & commandes

À implémenter :
- [ ] **US011** : Paiement sécurisé (escrow)
- [ ] **US012** : Libération des fonds après validation
- [ ] **US013** : Choix de livraison et suivi

### Sprint 9 : Admin & modération

À implémenter :
- [ ] **US014** : Dashboard admin
- [ ] **US015** : Modération des annonces et utilisateurs

## 🔧 Configuration nécessaire

### Variables d'environnement

Créer un fichier `.env` :

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[générer avec: openssl rand -base64 32]"
GOOGLE_CLIENT_ID="[optionnel]"
GOOGLE_CLIENT_SECRET="[optionnel]"
```

### Commandes de démarrage

```bash
# Installer les dépendances
pnpm install

# Générer le client Prisma
pnpm db:generate

# Initialiser la base de données
pnpm db:push

# Lancer le serveur de développement
pnpm dev
```

## 📝 Notes techniques

### Limitations actuelles

1. **Upload d'images** : Actuellement, les URLs d'images sont saisies manuellement. Pour le MVP, il faudra intégrer un service de stockage (Cloudinary, AWS S3, etc.)

2. **Email** : La réinitialisation de mot de passe nécessite un service d'email (Resend, SendGrid, etc.)

3. **Notifications push** : Nécessitera l'intégration d'un service (Firebase Cloud Messaging, OneSignal, etc.)

4. **Paiements** : Intégration d'un PSP serbe (Payten, eMerchantPay) à prévoir

### Améliorations suggérées

- [ ] Ajouter la validation côté client avec react-hook-form + zod
- [ ] Implémenter l'upload d'images avec preview
- [ ] Ajouter des tests unitaires et d'intégration
- [ ] Optimiser les images avec next/image
- [ ] Ajouter un système de cache (Redis) pour les performances
- [ ] Implémenter la recherche full-text
- [ ] Ajouter la pagination pour les listes

