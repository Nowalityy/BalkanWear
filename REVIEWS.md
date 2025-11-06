# Sprint Reviews/Avis - Implémentation

## Fonctionnalités implémentées

### 1. API Routes (`/api/reviews`)

#### GET `/api/reviews`
- **Paramètres** :
  - `userId` : Récupère tous les avis reçus par un utilisateur
  - `orderId` : Récupère l'avis pour une commande spécifique
- **Retour** :
  - Liste des avis avec reviewer, order et listing
  - Note moyenne calculée
  - Nombre total d'avis

#### POST `/api/reviews`
- **Validation** :
  - L'utilisateur doit être authentifié
  - La commande doit exister et appartenir à l'utilisateur (acheteur ou vendeur)
  - La commande doit être en statut "DELIVERED"
  - Un seul avis par commande
- **Création** :
  - Détermine automatiquement qui est le reviewer et le reviewee
  - Note entre 1 et 5
  - Commentaire optionnel

### 2. Composants

#### `ReviewForm`
- Formulaire pour laisser un avis
- Sélection de note (1-5 étoiles)
- Commentaire optionnel
- Validation côté client

#### `ReviewList`
- Affichage de la liste des avis
- Note moyenne et nombre total d'avis
- Informations du reviewer (nom, photo)
- Lien vers le listing concerné
- Date de l'avis

### 3. Intégration dans les pages

#### Page de détail de commande (`/orders/[id]`)
- Affichage du formulaire d'avis si :
  - La commande est en statut "DELIVERED"
  - L'utilisateur n'a pas encore laissé d'avis
- Message de confirmation après avoir laissé un avis

#### Page de profil (`/profile`)
- Section "Avis reçus" avec bouton pour afficher/masquer
- Affichage de tous les avis reçus par l'utilisateur
- Note moyenne et statistiques

## Flux utilisateur

1. **Après réception d'une commande** :
   - L'acheteur ou le vendeur peut marquer la commande comme "DELIVERED"
   - Le formulaire d'avis apparaît automatiquement
   - L'utilisateur peut laisser une note (1-5 étoiles) et un commentaire optionnel

2. **Consultation des avis** :
   - Sur le profil utilisateur, section "Avis reçus"
   - Affichage de la note moyenne et du nombre total d'avis
   - Liste détaillée avec commentaires et liens vers les listings

## Modèle de données

Le modèle `Review` dans Prisma :
- `id` : Identifiant unique
- `orderId` : ID de la commande (unique, un avis par commande)
- `reviewerId` : ID de l'utilisateur qui laisse l'avis
- `revieweeId` : ID de l'utilisateur qui reçoit l'avis
- `rating` : Note entre 1 et 5
- `comment` : Commentaire optionnel
- `createdAt` : Date de création

## Sécurité

- Seuls les participants à une commande peuvent laisser un avis
- Un seul avis par commande
- Les avis ne peuvent être laissés que pour les commandes livrées
- Validation côté serveur avec Zod

## Prochaines étapes possibles

- Système de réponse aux avis
- Modération des avis (admin)
- Filtrage et tri des avis
- Affichage des avis sur les pages de listing
- Badges de vendeur vérifié basés sur les avis

