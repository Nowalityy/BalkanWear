# Sprint 5-6 : Messagerie et notifications ✅

## Fonctionnalités implémentées

### ✅ US009 : Messagerie en temps réel
- Création automatique de conversation lors du clic sur "Contacter le vendeur"
- Liste des conversations avec dernier message et informations de l'annonce
- Page de conversation avec historique des messages
- Envoi de messages en temps réel
- Polling automatique toutes les 5 secondes pour rafraîchir les messages
- Marquage automatique des messages comme lus

### ⏳ US010 : Notifications push
- Structure prête pour les notifications
- Pour le MVP, on utilise le polling (rafraîchissement automatique)
- Les notifications push peuvent être ajoutées avec Firebase Cloud Messaging ou OneSignal

## Pages créées

1. **`/messages`** - Liste des conversations
2. **`/messages/[id]`** - Page de conversation avec messages

## API Routes créées

1. **`GET /api/conversations`** - Liste des conversations de l'utilisateur
2. **`POST /api/conversations`** - Créer une nouvelle conversation (ou récupérer existante)
3. **`GET /api/conversations/[id]/messages`** - Récupérer les messages d'une conversation
4. **`POST /api/conversations/[id]/messages`** - Envoyer un message

## Composants créés

1. **`MessageList`** - Affichage de la liste des messages avec formatage
2. **`MessageInput`** - Input pour envoyer des messages avec support Entrée/Shift+Entrée

## Fonctionnalités

### Messagerie
- ✅ Création automatique de conversation
- ✅ Détection de conversation existante (évite les doublons)
- ✅ Affichage des messages avec distinction envoyé/reçu
- ✅ Formatage des dates (il y a X min, il y a Xh, etc.)
- ✅ Scroll automatique vers le dernier message
- ✅ Marquage des messages comme lus
- ✅ Polling toutes les 5 secondes pour nouveaux messages
- ✅ Polling toutes les 30 secondes pour nouvelles conversations

### Interface
- ✅ Design moderne et responsive
- ✅ Affichage de l'image de l'annonce dans la liste
- ✅ Informations du vendeur/acheteur
- ✅ Lien vers l'annonce depuis la conversation
- ✅ Bouton "Contacter le vendeur" sur les pages d'annonces
- ✅ Lien "Messages" dans le header

## Améliorations futures

- [ ] Notifications push (Firebase Cloud Messaging, OneSignal)
- [ ] WebSockets pour messages en temps réel (remplacer le polling)
- [ ] Indicateur de "en train d'écrire..."
- [ ] Envoi d'images dans les messages
- [ ] Réactions aux messages (emoji)
- [ ] Recherche dans les conversations
- [ ] Filtres (non lus, par annonce, etc.)
- [ ] Notifications sonores
- [ ] Badge avec nombre de messages non lus dans le header

## Notes techniques

- Le polling est utilisé pour le MVP (simple et fonctionnel)
- Les conversations sont liées à une annonce spécifique
- Un utilisateur ne peut avoir qu'une conversation par annonce avec un autre utilisateur
- Les messages sont marqués comme lus automatiquement lors de l'ouverture
- Support Entrée pour envoyer, Shift+Entrée pour nouvelle ligne

