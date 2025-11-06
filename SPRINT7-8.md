# Sprint 7-8 : Paiements & commandes ✅

## Fonctionnalités implémentées

### ✅ US011 : Paiement sécurisé (escrow)
- Système d'escrow simulé pour le MVP
- Statut de paiement : PENDING → HELD (bloqué) → RELEASED (libéré)
- Les fonds sont bloqués jusqu'à confirmation de réception par l'acheteur
- Pour la production, intégration avec un PSP serbe nécessaire (Payten, eMerchantPay)

### ✅ US012 : Libération des fonds après validation
- Le vendeur reçoit l'argent une fois la commande marquée comme "DELIVERED"
- Statut de paiement passe automatiquement de HELD à RELEASED
- Système de confirmation en deux étapes (expédition + réception)

### ✅ US013 : Choix de livraison et suivi
- Sélection du mode de livraison (STANDARD ou EXPRESS)
- Frais de livraison : 2€ (standard) ou 5€ (express)
- Suivi de commande avec statuts détaillés
- Mise à jour du statut par le vendeur (expédition) et l'acheteur (réception)

## Pages créées

1. **`/checkout/[listingId]`** - Page de checkout avec sélection de livraison
2. **`/orders`** - Liste des commandes (achats et ventes)
3. **`/orders/[id]`** - Détails et suivi d'une commande

## API Routes créées

1. **`GET /api/orders`** - Liste des commandes (avec paramètre `role=buyer` ou `role=seller`)
2. **`POST /api/orders`** - Créer une nouvelle commande
3. **`GET /api/orders/[id]`** - Détails d'une commande
4. **`PATCH /api/orders/[id]`** - Mettre à jour le statut d'une commande

## Composants créés

1. **`OrderStatus`** - Affichage du statut de commande et de paiement avec badges colorés

## Fonctionnalités

### Workflow de commande

1. **Acheteur** :
   - Clique sur "Acheter maintenant" sur une annonce
   - Remplit l'adresse de livraison
   - Choisit le mode de livraison
   - Confirme la commande → Statut : PENDING, PaymentStatus : PENDING

2. **Système** :
   - L'annonce est marquée comme SOLD
   - Le paiement est simulé (en production : redirection vers PSP)
   - Statut passe à PAID, PaymentStatus : HELD (escrow)

3. **Vendeur** :
   - Voit la commande dans "Mes commandes" → "Mes ventes"
   - Peut marquer comme "Expédié" → Statut : SHIPPED

4. **Acheteur** :
   - Voit que la commande est expédiée
   - Confirme la réception → Statut : DELIVERED
   - Les fonds sont libérés automatiquement → PaymentStatus : RELEASED

### Sécurité

- ✅ Vérification que l'utilisateur ne peut pas acheter sa propre annonce
- ✅ Vérification qu'une annonce ne peut être achetée qu'une fois
- ✅ Vérification des permissions pour modifier le statut (vendeur = expédition, acheteur = réception)
- ✅ Protection contre les commandes multiples sur la même annonce

## Améliorations futures

- [ ] Intégration réelle avec PSP serbe (Payten, eMerchantPay)
- [ ] Webhook pour les notifications de paiement
- [ ] Suivi de colis avec numéro de suivi
- [ ] Notifications email pour chaque changement de statut
- [ ] Système de remboursement
- [ ] Gestion des litiges
- [ ] Historique des transactions
- [ ] Factures PDF
- [ ] Intégration avec transporteurs serbes (Posta Srbije, Aks Express, D Express)

## Notes techniques

- Le système d'escrow est simulé pour le MVP
- Les frais de livraison sont fixes (2€ standard, 5€ express)
- L'annonce est automatiquement marquée comme SOLD lors de la création de commande
- Le polling est utilisé pour rafraîchir le statut (toutes les 10 secondes)
- En production, il faudra intégrer un vrai PSP avec webhooks

