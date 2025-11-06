# BalkanWear - MVP

Plateforme mobile + web de vêtements et accessoires d'occasion ciblant la Serbie (Belgrade) puis extensible aux pays des Balkans.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- pnpm (ou npm/yarn)

### Installation

1. Cloner le repository et installer les dépendances :

```bash
pnpm install
```

2. Configurer les variables d'environnement :

Créez un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# OAuth Providers (optionnel pour le MVP)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Pour générer `NEXTAUTH_SECRET` :
```bash
openssl rand -base64 32
```

3. Initialiser la base de données :

```bash
pnpm db:generate
pnpm db:push
```

4. Créer un utilisateur admin (optionnel) :

```bash
pnpm admin:promote <votre-email>
```

5. Lancer le serveur de développement :

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
balkanwear/
├── app/                    # App Router Next.js
│   ├── api/               # API routes
│   │   ├── auth/          # Routes d'authentification
│   │   ├── admin/         # Routes admin
│   │   ├── conversations/ # Routes de messagerie
│   │   ├── listings/      # Routes d'annonces
│   │   └── orders/        # Routes de commandes
│   ├── admin/             # Pages admin
│   ├── auth/              # Pages d'authentification
│   ├── checkout/          # Page de checkout
│   ├── listings/          # Pages d'annonces
│   ├── messages/          # Pages de messagerie
│   ├── orders/            # Pages de commandes
│   └── profile/           # Page de profil
├── components/            # Composants React
│   ├── ui/                # Composants UI réutilisables
│   └── Header.tsx         # Header avec navigation
├── lib/                   # Utilitaires et configurations
│   ├── auth.ts           # Configuration NextAuth
│   ├── prisma.ts         # Client Prisma
│   ├── admin.ts          # Utilitaires admin
│   └── utils.ts          # Fonctions utilitaires
├── prisma/               # Schéma Prisma
│   └── schema.prisma     # Modèles de données
├── scripts/              # Scripts utilitaires
│   └── make-admin.ts     # Promouvoir un utilisateur en admin
└── types/                # Types TypeScript
```

## 🎯 Fonctionnalités implémentées

### Sprint Reviews/Avis : Système d'évaluation ✅
- ✅ API pour créer et consulter les avis (`/api/reviews`)
- ✅ Formulaire d'avis après réception d'une commande
- ✅ Affichage des avis sur le profil utilisateur avec note moyenne
- ✅ Validation et sécurité (un avis par commande, uniquement pour les commandes livrées)
- ✅ Composants `ReviewForm` et `ReviewList`

### Sprint 1-2 : Authentification & Profil ✅
- ✅ Authentification par email/mot de passe
- ✅ Authentification OAuth (Google)
- ✅ Création de compte
- ✅ Connexion/Déconnexion
- ✅ Réinitialisation de mot de passe (structure)
- ✅ Profil utilisateur (photo, pseudonyme, ville)

### Sprint 3-4 : Création et affichage d'annonces ✅
- ✅ Création d'annonce avec photos, titre, description, prix, catégorie
- ✅ Affichage des annonces récentes dans un flux
- ✅ Filtres par taille, marque, prix et état
- ✅ Modification/suppression d'annonces

### Sprint 5-6 : Messagerie et notifications ✅
- ✅ Messagerie en temps réel avec polling
- ✅ Création automatique de conversations
- ✅ Envoi et réception de messages
- ✅ Marquage des messages comme lus

### Sprint 7-8 : Paiements & commandes ✅
- ✅ Système d'escrow (simulé pour MVP)
- ✅ Création de commandes avec choix de livraison
- ✅ Suivi de commande avec statuts
- ✅ Libération des fonds après réception

### Sprint 9 : Admin & modération ✅
- ✅ Dashboard admin avec KPI
- ✅ Gestion des annonces (liste, suppression)
- ✅ Gestion des utilisateurs (liste, suspension)
- ✅ Protection des routes admin

## 📋 Prochaines étapes (Post-MVP)

- Intégration PSP serbe (Payten, eMerchantPay)
- Notifications push (Firebase Cloud Messaging)
- Upload d'images direct (Cloudinary, AWS S3)
- WebSockets pour messagerie temps réel
- Recommandations personnalisées

## 🛠️ Technologies utilisées

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Prisma** - ORM pour la base de données
- **NextAuth.js** - Authentification
- **Tailwind CSS 4** - Styling
- **SQLite** - Base de données (dev) / PostgreSQL (production)
- **Zod** - Validation de schémas

## 📝 Scripts disponibles

- `pnpm dev` - Lancer le serveur de développement
- `pnpm build` - Build de production
- `pnpm start` - Lancer le serveur de production
- `pnpm lint` - Lancer ESLint
- `pnpm db:generate` - Générer le client Prisma
- `pnpm db:push` - Pousser le schéma vers la DB (dev)
- `pnpm db:migrate` - Créer une migration
- `pnpm db:studio` - Ouvrir Prisma Studio
- `pnpm admin:promote <email>` - Promouvoir un utilisateur en admin

## 🔒 Sécurité

- Les mots de passe sont hashés avec bcrypt
- Sessions sécurisées avec NextAuth
- Validation des données avec Zod
- Protection CSRF intégrée à NextAuth
- Protection des routes admin
- Vérification des permissions sur toutes les actions

## 📄 Documentation

- [CDD.md](./CDD.md) - Cahier des charges complet
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - État d'avancement détaillé
- [SPRINT3-4.md](./SPRINT3-4.md) - Détails Sprint 3-4
- [SPRINT5-6.md](./SPRINT5-6.md) - Détails Sprint 5-6
- [SPRINT7-8.md](./SPRINT7-8.md) - Détails Sprint 7-8
- [SPRINT9.md](./SPRINT9.md) - Détails Sprint 9
- [REVIEWS.md](./REVIEWS.md) - Détails système de reviews/avis

## 📄 Licence

Propriétaire - Tous droits réservés
