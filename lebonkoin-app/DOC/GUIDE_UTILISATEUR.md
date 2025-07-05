# 👤 Guide Utilisateur - LeBonKoin

## 🎯 Bienvenue sur LeBonKoin

LeBonKoin est la **première marketplace décentralisée cross-chain** qui vous permet d'acheter et vendre des produits avec des **paiements USDC instantanés** entre différentes blockchains.

---

## 🚀 Premiers Pas

### 1. Accéder à l'Application

1. **Ouvrir votre navigateur** et aller sur http://localhost:3000
2. **Vérifier votre wallet** (MetaMask, WalletConnect, etc.)
3. **Connecter votre wallet** en cliquant sur "Connecter"

### 2. Configuration Initiale

#### Réseaux Supportés
- **Ethereum Sepolia** (testnet)
- **Base Sepolia** (testnet)
- **Arbitrum Sepolia** (testnet)
- **Avalanche Fuji** (testnet)
- **Linea Sepolia** (testnet)

#### Tokens Requis
- **USDC testnet** pour les paiements
- **ETH testnet** pour les frais de gas

---

## 🛒 Utiliser la Marketplace

### 1. Parcourir les Produits

#### Navigation
- **Accueil** : Vue d'ensemble des produits populaires
- **Marketplace** : Catalogue complet avec filtres
- **Catégories** : Produits organisés par type

#### Filtres Disponibles
- **Prix** : Fourchette de prix
- **Catégorie** : Électronique, Mode, Maison, etc.
- **Localisation** : Ville, région
- **État** : Neuf, Très bon état, Bon état, etc.

### 2. Rechercher des Produits

```
🔍 Barre de recherche
┌─────────────────────────────────────┐
│ Rechercher un produit...            │
└─────────────────────────────────────┘

🏷️ Filtres
├── Prix: 0€ - 1000€
├── Catégorie: Toutes
├── État: Tous
└── Localisation: Toutes
```

### 3. Consulter un Produit

#### Informations Affichées
- **Photos** : Galerie d'images
- **Description** : Détails du produit
- **Prix** : En EUR et USDC
- **Vendeur** : Profil et réputation
- **Localisation** : Ville et région
- **État** : Condition du produit

#### Actions Disponibles
- **Acheter maintenant (CCTP V2)** : Paiement cross-chain
- **Ajouter aux favoris** : Sauvegarder pour plus tard
- **Contacter le vendeur** : Envoyer un message
- **Signaler** : Signaler un problème

---

## 💳 Effectuer un Paiement Cross-Chain

### 1. Processus d'Achat

#### Étape 1 : Sélection du Produit
1. **Cliquer** sur le produit souhaité
2. **Vérifier** les détails et le prix
3. **Cliquer** sur "Acheter maintenant (CCTP V2)"

#### Étape 2 : Configuration du Paiement
```
🔄 Configuration Cross-Chain
┌─────────────────────────────────────┐
│ Chaîne Source                       │
│ ├── Ethereum Sepolia (150 USDC)    │
│ ├── Base Sepolia (75 USDC)         │
│ └── Arbitrum Sepolia (200 USDC)    │
│                                     │
│ Chaîne Destination                  │
│ ├── Base Sepolia                    │
│ ├── Ethereum Sepolia               │
│ └── Avalanche Fuji                 │
│                                     │
│ Estimation des frais: ~2-5 USDC    │
└─────────────────────────────────────┘
```

#### Étape 3 : Prévisualisation ERC-7730
```
🔍 Signature Transparente
┌─────────────────────────────────────┐
│ 🔄 Transfert USDC Cross-Chain       │
│                                     │
│ Montant: 150.00 USDC               │
│ De: Ethereum Sepolia               │
│ Vers: Base Sepolia                 │
│ Destinataire: 0x1234...5678        │
│                                     │
│ ⚠️ Points d'attention               │
│ • Vérifiez l'adresse du destinataire│
│ • Les frais de gas seront prélevés  │
│ • Le transfert peut prendre 2-5 min │
└─────────────────────────────────────┘
```

#### Étape 4 : Exécution
1. **Approbation USDC** (si nécessaire)
2. **Transfert CCTP** avec suivi temps réel
3. **Attestation Circle** automatique
4. **Finalisation** sur la chaîne de destination

### 2. Suivi du Transfert

#### Interface de Suivi
```
📊 Suivi du Transfert
┌─────────────────────────────────────┐
│ ✅ 1. Approbation USDC              │
│ ✅ 2. Transfert initié              │
│ 🔄 3. Attestation Circle            │
│ ⏳ 4. Finalisation                  │
│                                     │
│ Hash: 0xabc123...                   │
│ Temps estimé: 2-5 minutes          │
└─────────────────────────────────────┘
```

#### États Possibles
- **Pending** : Transaction en cours
- **Attesting** : Attestation Circle
- **Finalizing** : Finalisation sur destination
- **Completed** : Transfert terminé
- **Failed** : Erreur (avec détails)

---

## 🆔 Vérification World ID

### 1. Pourquoi se Vérifier ?

#### Avantages
- **Confiance** : Badge "Vérifié" sur votre profil
- **Sécurité** : Prévention des bots et faux comptes
- **Réputation** : Amélioration de votre score de confiance

### 2. Processus de Vérification

#### Étape 1 : Initier la Vérification
1. **Aller** dans votre profil
2. **Cliquer** sur "Vérifier avec World ID"
3. **Scanner** le QR code avec l'app World ID

#### Étape 2 : Confirmation
```
🌍 Vérification World ID
┌─────────────────────────────────────┐
│ 📱 Scannez le QR code avec          │
│    l'application World ID           │
│                                     │
│ ████████████████████████████████    │
│ ████████████████████████████████    │
│ ████████████████████████████████    │
│ ████████████████████████████████    │
│                                     │
│ Ou utilisez ce lien:                │
│ https://worldcoin.org/verify/...    │
└─────────────────────────────────────┘
```

#### Étape 3 : Validation
- **Confirmation** dans l'app World ID
- **Vérification** automatique sur LeBonKoin
- **Badge** "Vérifié" ajouté à votre profil

---

## 👤 Gérer votre Profil

### 1. Informations Personnelles

#### Données Affichées
- **Adresse Wallet** : Identifiant unique
- **Statut World ID** : Vérifié ou non
- **Réputation** : Score basé sur les transactions
- **Date d'inscription** : Ancienneté du compte

#### Modifier votre Profil
```
👤 Mon Profil
┌─────────────────────────────────────┐
│ Nom d'affichage: [Modifier]         │
│ Avatar: [Changer]                   │
│ Bio: [Ajouter une description]      │
│                                     │
│ 🌍 Statut: Vérifié World ID        │
│ ⭐ Réputation: 4.8/5 (23 avis)      │
│ 📅 Membre depuis: Jan 2024         │
└─────────────────────────────────────┘
```

### 2. Historique des Transactions

#### Achats
- **Produits achetés** avec détails
- **Statut des paiements** CCTP
- **Historique des transferts**

#### Ventes
- **Produits vendus**
- **Revenus reçus**
- **Évaluations clients**

---

## 📱 Interface Mobile

### 1. Navigation Mobile

#### Menu Principal
```
📱 Menu Mobile
┌─────────────────────────────────────┐
│ 🏠 Accueil                          │
│ 🛒 Marketplace                      │
│ ❤️ Favoris                          │
│ 👤 Profil                           │
│ 💳 Wallet                           │
│ ⚙️ Paramètres                       │
└─────────────────────────────────────┘
```

### 2. Optimisations Mobile

#### Fonctionnalités
- **Touch-friendly** : Boutons adaptés au tactile
- **Swipe** : Navigation par glissement
- **Responsive** : Adaptation automatique
- **Offline** : Consultation hors ligne

---

## 🔧 Paramètres et Préférences

### 1. Paramètres Généraux

#### Configuration
```
⚙️ Paramètres
┌─────────────────────────────────────┐
│ 🌐 Langue: Français                 │
│ 💰 Devise: EUR                      │
│ 🔔 Notifications: Activées          │
│ 🌙 Thème: Clair                     │
│ 📍 Localisation: Paris, France      │
└─────────────────────────────────────┘
```

### 2. Paramètres Blockchain

#### Réseaux Préférés
- **Réseau principal** : Pour les paiements
- **Réseaux secondaires** : Pour la réception
- **Frais de gas** : Estimation automatique

#### Sécurité
- **Signature automatique** : Activée/Désactivée
- **Confirmations** : Nombre de confirmations
- **Timeout** : Délai d'expiration des transactions

---

## 🛡️ Sécurité et Bonnes Pratiques

### 1. Sécurité des Paiements

#### Vérifications Importantes
✅ **Toujours vérifier** l'adresse du destinataire
✅ **Confirmer le montant** avant signature
✅ **Vérifier la chaîne** de destination
✅ **Garder vos clés privées** sécurisées

#### Signaux d'Alerte
❌ **Prix trop bas** par rapport au marché
❌ **Vendeur non vérifié** avec peu d'historique
❌ **Demande de paiement** hors plateforme
❌ **Urgence artificielle** pour la vente

### 2. Protection des Données

#### Données Collectées
- **Adresse wallet** : Publique sur blockchain
- **Historique transactions** : Visible sur blockchain
- **Préférences** : Stockées localement
- **World ID** : Hash anonyme uniquement

#### Vos Droits
- **Accès** : Consultation de vos données
- **Rectification** : Modification des informations
- **Suppression** : Suppression du compte
- **Portabilité** : Export de vos données

---

## 🆘 Support et Dépannage

### 1. Problèmes Courants

#### Connexion Wallet
**Problème** : Wallet non détecté
**Solution** :
1. Vérifier que MetaMask est installé
2. Actualiser la page
3. Vérifier les permissions du navigateur

#### Paiement CCTP
**Problème** : Transfert bloqué
**Solution** :
1. Vérifier le solde USDC
2. Vérifier les frais de gas
3. Attendre la confirmation réseau

#### Vérification World ID
**Problème** : Échec de vérification
**Solution** :
1. Vérifier l'app World ID
2. Vérifier la connexion internet
3. Réessayer après quelques minutes

### 2. Codes d'Erreur

#### Erreurs Fréquentes
- **E001** : Solde insuffisant
- **E002** : Réseau non supporté
- **E003** : Transaction expirée
- **E004** : Échec d'attestation
- **E005** : Erreur de signature

### 3. Contacter le Support

#### Canaux de Support
- **Chat en direct** : Disponible 24/7
- **Email** : support@lebonkoin.com
- **Documentation** : guides détaillés
- **Communauté** : Discord et Telegram

---

## 📊 Statistiques et Analytics

### 1. Tableau de Bord Personnel

#### Métriques Affichées
```
📊 Mes Statistiques
┌─────────────────────────────────────┐
│ 💰 Volume d'achats: 1,250 USDC     │
│ 🛒 Produits achetés: 8             │
│ 💎 Produits vendus: 3              │
│ ⭐ Note moyenne: 4.9/5              │
│ 🔄 Transferts CCTP: 15             │
│ 💸 Frais économisés: 45 USDC       │
└─────────────────────────────────────┘
```

### 2. Historique Détaillé

#### Exports Disponibles
- **CSV** : Pour analyse Excel
- **JSON** : Pour développeurs
- **PDF** : Pour archivage
- **Blockchain** : Liens vers explorateurs

---

## 🎯 Conseils pour Bien Commencer

### 1. Premiers Achats

#### Recommandations
1. **Commencer petit** : Achats de faible montant
2. **Vérifier les vendeurs** : Profils vérifiés World ID
3. **Lire les descriptions** : Détails et photos
4. **Tester les réseaux** : Différentes chaînes

### 2. Optimiser vos Paiements

#### Stratégies
- **Choisir le bon réseau** : Frais plus bas
- **Grouper les achats** : Économiser sur les frais
- **Surveiller les prix** : USDC vs EUR
- **Utiliser les favoris** : Suivre les prix

### 3. Construire sa Réputation

#### Actions Recommandées
- **Se vérifier** avec World ID
- **Compléter son profil** : Photo et description
- **Laisser des avis** : Après chaque transaction
- **Être réactif** : Répondre rapidement

---

## 🚀 Fonctionnalités Avancées

### 1. API pour Développeurs

#### Endpoints Disponibles
```javascript
// Récupérer les listings
GET /api/listings

// Créer une transaction
POST /api/transactions

// Suivre un transfert CCTP
GET /api/cctp/track/:hash
```

### 2. Intégrations Futures

#### Prochaines Fonctionnalités
- **NFT Receipts** : Reçus sous forme de NFT
- **Escrow Smart Contracts** : Paiements sécurisés
- **Multi-token Support** : Autres cryptomonnaies
- **DAO Governance** : Participation communautaire

---

## 🎉 Félicitations !

Vous êtes maintenant prêt à utiliser LeBonKoin comme un pro ! 

**N'hésitez pas à** :
- Explorer la marketplace
- Tester les paiements cross-chain
- Vous vérifier avec World ID
- Rejoindre notre communauté

**Bon shopping décentralisé !** 🛒✨ 