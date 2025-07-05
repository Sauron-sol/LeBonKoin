# 🚀 LeBonKoin - Marketplace Décentralisée Cross-Chain

**Marketplace révolutionnaire combinant CCTP V2 et ERC-7730 pour des paiements cross-chain transparents et sécurisés**

> 🏆 **Submission pour :** Circle CCTP V2 Multichain USDC Payment System ($4,000) + Ledger Clear Signing ERC-7730 ($4,000)

## 🎯 Vision du Projet

LeBonKoin réinvente le e-commerce décentralisé en résolvant les deux plus gros problèmes des DApps actuelles :
1. **Complexité des paiements cross-chain** → Résolu avec CCTP V2
2. **Opacité des transactions blockchain** → Résolu avec ERC-7730 Clear Signing

## ✨ Fonctionnalités Principales

### 🔄 **Paiements Cross-Chain CCTP V2**
- **Support complet** : Ethereum, Avalanche, Base, Arbitrum, Linea
- **Transferts rapides** natifs CCTP V2 avec attestations Circle
- **Interface intuitive** pour sélectionner chaîne source/destination
- **Estimation des frais** en temps réel
- **Suivi en temps réel** des étapes de transfert

### 🔍 **Signature Transparente ERC-7730**
- **Descriptions lisibles** de chaque transaction
- **Métadonnées JSON** conformes au standard Ledger
- **Prévisualisation détaillée** avant signature
- **Points de sécurité** automatiquement affichés
- **Compatible Ledger** et tous wallets supportant ERC-7730

### 🛒 **Marketplace Complète**
- **Base de données PostgreSQL** avec Prisma ORM
- **Images réelles** via Picsum Photos
- **Recherche avancée** avec filtres
- **World ID** pour la vérification des utilisateurs
- **Interface moderne** avec Next.js 14 et Tailwind CSS

## 🏗️ Architecture Technique

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   CCTP V2        │    │   ERC-7730      │
│   Next.js 14    │ ←→ │   Service        │ ←→ │   Clear Sign    │
│   + RainbowKit  │    │   Multi-chain    │    │   Service       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ↕                        ↕                        ↕
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Database      │    │   Circle APIs    │    │   Ledger        │
│   PostgreSQL    │    │   Attestations   │    │   Registry      │
│   + Prisma      │    │   + Fast Transfer│    │   + JSON Files  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Technologies Utilisées

### **Blockchain & Web3**
- **CCTP V2** : Transferts natifs USDC cross-chain
- **Viem** : Interactions blockchain type-safe
- **RainbowKit** : Connexion wallet moderne
- **World ID** : Vérification d'identité

### **Clear Signing**
- **ERC-7730** : Standard Ledger pour la transparence
- **Métadonnées JSON** : Descriptions lisibles des transactions
- **Registry-ready** : Fichiers prêts pour soumission Ledger

### **Backend & Base de Données**
- **Next.js 14** : Full-stack React framework
- **PostgreSQL** : Base de données relationnelle
- **Prisma** : ORM type-safe
- **Docker** : Containerisation

### **Frontend**
- **TypeScript** : Type safety
- **Tailwind CSS** : Styling moderne
- **Responsive Design** : Mobile-first

## 🚀 Installation & Lancement

### Prérequis
```bash
- Node.js 18+
- Docker & Docker Compose
- Git
```

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd lebonkoin-app

# Installer les dépendances
npm install

# Lancer la base de données
docker-compose up -d

# Configurer la base de données
npx prisma db push
npx prisma db seed

# Lancer l'application
npm run dev
```

### Variables d'environnement
```env
# Base de données
DATABASE_URL="postgresql://lebonkoin_user:lebonkoin_password@localhost:5432/lebonkoin"

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-project-id"

# World ID
NEXT_PUBLIC_WLD_APP_ID="app_staging_your-app-id"
NEXT_PUBLIC_WLD_ACTION_ID="your-action-id"
```

## 💳 Démonstration du Paiement Cross-Chain

### Flux Utilisateur
1. **Navigation** : Parcourir les articles sur `/marketplace`
2. **Sélection** : Cliquer sur un article pour voir les détails
3. **Achat** : Cliquer sur "Acheter maintenant (CCTP V2)"
4. **Configuration** :
   - Sélectionner la chaîne source (solde USDC affiché)
   - Sélectionner la chaîne de destination
   - Voir l'estimation des frais
5. **Prévisualisation ERC-7730** :
   - Description claire de la transaction
   - Détails du transfert (montant, destinataire, chaînes)
   - Points de sécurité affichés
6. **Exécution** :
   - Approbation USDC (si nécessaire)
   - Transfert CCTP avec suivi en temps réel
   - Attestation Circle automatique
   - Finalisation sur chaîne de destination

### Signature Transparente
```
🔍 Signature Transparente (ERC-7730)
🔄 Transfert USDC Cross-Chain

Transfert de 150.00 USDC de Ethereum vers Base

Montant: 150.00 USDC
De: Ethereum  
Vers: Base
Destinataire: 0x1234...5678

⚠️ Points d'attention
• Les transferts cross-chain peuvent prendre plusieurs minutes
• Vérifiez que l'adresse du destinataire est correcte
• Les frais de gas seront prélevés sur votre solde
```

## 🏆 Submission Details

### **Circle CCTP V2 Bounty ($4,000)**
- ✅ **MVP fonctionnel** avec interface complète
- ✅ **Support multichain** : 5 blockchains (Ethereum, Avalanche, Base, Arbitrum, Linea)
- ✅ **Fast Transfers** avec attestations Circle
- ✅ **Documentation complète** et diagramme d'architecture
- ✅ **Vidéo de démonstration** (à venir)
- ✅ **Code open source** avec repository GitHub

### **Ledger ERC-7730 Bounty ($4,000)**
- ✅ **Implémentation complète** du standard ERC-7730
- ✅ **Métadonnées JSON** prêtes pour le registry Ledger
- ✅ **Service de signature transparente** intégré
- ✅ **Interface utilisateur** montrant les descriptions claires
- ✅ **Feedback sur le standard** via l'implémentation pratique

## 📁 Structure du Projet

```
lebonkoin-app/
├── src/
│   ├── app/                    # Pages Next.js
│   │   ├── marketplace/        # Pages marketplace
│   │   └── api/               # API routes
│   ├── components/            # Composants React
│   │   └── MultichainPayment.tsx  # Interface paiement
│   ├── hooks/                 # Hooks React personnalisés
│   │   └── useMultichainPayment.ts  # Logic paiement
│   ├── lib/                   # Services et utilitaires
│   │   ├── cctp.ts           # Service CCTP V2
│   │   ├── erc7730.ts        # Service ERC-7730
│   │   ├── prisma.ts         # Client Prisma
│   │   └── wagmi.ts          # Configuration Web3
│   └── types/                 # Types TypeScript
├── public/
│   └── erc7730/              # Fichiers JSON ERC-7730
├── prisma/                   # Schema et seeds
├── docker-compose.yml        # PostgreSQL
└── README.md
```

## 🎥 Démonstration Vidéo

**[Lien vers la vidéo de démonstration]** *(à ajouter)*

### Points clés démontrés :
1. Navigation de la marketplace
2. Sélection d'un produit
3. Configuration du paiement cross-chain
4. Signature transparente ERC-7730
5. Exécution complète du transfert CCTP V2
6. Confirmation de réception

## 🔮 Évolutions Futures

### **Fonctionnalités Avancées**
- **Smart Contracts** de marketplace pour l'escrow
- **NFT Receipts** pour les achats
- **Reputation System** on-chain
- **Multi-token Support** (pas seulement USDC)

### **Optimisations CCTP**
- **Hooks CCTP V2** pour les transferts programmables
- **Batch Payments** pour plusieurs articles
- **Liquidity Provider** integration

### **Améliorations ERC-7730**
- **Registry Submission** officielle chez Ledger
- **Custom Formatters** pour des cas d'usage spécifiques
- **Multi-language Support** pour l'internationalisation

## 👥 Équipe

**LeBonKoin Team** - Développement full-stack Web3

## 📄 Licence

MIT License - Open Source

---

**🎯 Objectif :** Démontrer l'avenir des paiements cross-chain sécurisés et transparents avec l'écosystème Web3 moderne.

**💡 Innovation :** Première marketplace combinant CCTP V2 et ERC-7730 pour une expérience utilisateur révolutionnaire. 