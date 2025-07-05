# 📚 Guide de Fonctionnement - LeBonKoin

## 🎯 Vue d'ensemble

LeBonKoin est une **marketplace décentralisée cross-chain** qui révolutionne le e-commerce en combinant :
- **CCTP V2** pour les paiements cross-chain transparents
- **ERC-7730** pour la signature claire et sécurisée
- **World ID** pour la vérification d'identité
- **PostgreSQL + Prisma** pour la gestion des données

---

## 🏗️ Architecture Technique

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   CCTP V2        │    │   ERC-7730      │
│   Next.js 15    │ ←→ │   Service        │ ←→ │   Clear Sign    │
│   + RainbowKit  │    │   Multi-chain    │    │   Service       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ↕                        ↕                        ↕
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Database      │    │   Circle APIs    │    │   Ledger        │
│   PostgreSQL    │    │   Attestations   │    │   Registry      │
│   + Prisma      │    │   + Fast Transfer│    │   + JSON Files  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🚀 Démarrage du Projet

### 1. Prérequis
```bash
- Node.js 18+
- Docker Desktop
- Git
- Navigateur avec extension wallet (MetaMask, etc.)
```

### 2. Installation
```bash
# Cloner le repository
git clone <repository-url>
cd lebonkoin-app

# Installer les dépendances
npm install

# Configurer Docker pour PostgreSQL
export PATH="/c/Program Files/Docker/Docker/resources/bin:$PATH"
docker-compose up -d postgres

# Configurer la base de données
npx prisma generate
npx prisma db push
npm run db:seed

# Lancer l'application
npm run dev
```

### 3. Configuration Environnement
Créer un fichier `.env` avec :
```env
# Base de données
DATABASE_URL="postgresql://lebonkoin_user:lebonkoin_password@localhost:5433/lebonkoin"

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-project-id"

# World ID
NEXT_PUBLIC_WLD_APP_ID="app_staging_your-app-id"
NEXT_PUBLIC_WLD_ACTION_ID="your-action-id"
```

---

## 🔧 Fonctionnement Détaillé

### 📱 Frontend (Next.js 15)

#### Structure des dossiers
```
src/
├── app/                    # Pages et routes Next.js
│   ├── marketplace/        # Pages marketplace
│   ├── api/               # API routes
│   └── providers.tsx      # Configuration Web3
├── components/            # Composants React
├── hooks/                 # Hooks personnalisés
├── lib/                   # Services et utilitaires
│   ├── cctp.ts           # Service CCTP V2
│   ├── erc7730.ts        # Service ERC-7730
│   ├── wagmi.ts          # Configuration Web3
│   └── prisma.ts         # Client base de données
└── types/                 # Types TypeScript
```

#### Providers Web3
Le fichier `src/app/providers.tsx` configure :
- **WagmiProvider** : Connexion blockchain
- **RainbowKitProvider** : Interface wallet
- **QueryClientProvider** : Gestion des requêtes
- **WorldIDProvider** : Vérification d'identité

### 🗄️ Base de Données (PostgreSQL + Prisma)

#### Modèles de données
```prisma
model User {
  id           String   @id @default(cuid())
  address      String   @unique
  worldIdHash  String?  @unique
  isVerified   Boolean  @default(false)
  // Relations
  listings     Listing[]
  purchases    Transaction[]
}

model Listing {
  id          String      @id @default(cuid())
  title       String
  description String
  price       Decimal
  currency    Currency    @default(EUR)
  // Relations
  seller      User
  transactions Transaction[]
}

model Transaction {
  id              String            @id @default(cuid())
  amount          Decimal
  status          TransactionStatus
  paymentMethod   PaymentMethod     @default(CCTP)
  // Blockchain data
  txHash          String?
  chainId         Int?
  cctpDomain      Int?
  messageHash     String?
  erc7730Metadata Json?
}
```

#### Commandes Prisma utiles
```bash
# Générer le client
npx prisma generate

# Synchroniser la base
npx prisma db push

# Ajouter des données de test
npm run db:seed

# Interface graphique
npx prisma studio
```

### 🔄 Paiements Cross-Chain (CCTP V2)

#### Service CCTP (`src/lib/cctp.ts`)

**Fonctionnalités principales :**
- Transferts USDC natifs cross-chain
- Support de 5 blockchains (Ethereum, Base, Arbitrum, Avalanche, Linea)
- Attestations Circle automatiques
- Suivi en temps réel des transferts

**Flux de paiement :**
1. **Sélection des chaînes** source et destination
2. **Approbation USDC** si nécessaire
3. **Transfert CCTP** avec message hash
4. **Attestation Circle** automatique
5. **Finalisation** sur chaîne de destination

**Code exemple :**
```typescript
// Initier un transfert CCTP
const transferResult = await initiateCCTPTransfer({
  amount: parseUnits("150", 6), // 150 USDC
  sourceChain: 11155111,        // Ethereum Sepolia
  targetChain: 84532,           // Base Sepolia
  recipient: "0x...",
  signer: walletSigner
});

// Suivre le transfert
const status = await trackCCTPTransfer(transferResult.messageHash);
```

### 🔍 Signature Transparente (ERC-7730)

#### Service ERC-7730 (`src/lib/erc7730.ts`)

**Objectif :** Rendre les transactions blockchain lisibles par les humains

**Fonctionnalités :**
- Génération de métadonnées JSON conformes ERC-7730
- Descriptions claires des transactions
- Points de sécurité automatiques
- Compatible avec Ledger et autres wallets

**Exemple de métadonnées :**
```json
{
  "context": {
    "contract": "0x...",
    "chainId": 11155111
  },
  "metadata": {
    "displayName": "Transfert USDC Cross-Chain",
    "description": "Transfert de 150.00 USDC de Ethereum vers Base"
  },
  "display": {
    "formats": {
      "amount": {
        "type": "amount",
        "currency": "USDC",
        "decimals": 6
      }
    }
  }
}
```

### 🌍 Vérification d'Identité (World ID)

#### Service World ID (`src/lib/worldid.tsx`)

**Intégration :**
- Vérification anti-bot avec World ID
- Stockage sécurisé du nullifier hash
- Amélioration de la réputation utilisateur

**Utilisation :**
```typescript
const { open } = useWorldID();

const handleVerify = () => {
  open({
    action: "verify-identity",
    onSuccess: (result) => {
      // Utilisateur vérifié
      console.log("Verified:", result.nullifier_hash);
    }
  });
};
```

---

## 🛒 Utilisation de la Marketplace

### 1. Accès à l'application
- Ouvrir http://localhost:3000
- Connecter son wallet (MetaMask, etc.)

### 2. Navigation
- **Accueil** : Vue d'ensemble et statistiques
- **Marketplace** : Parcourir les produits
- **Profil** : Gérer ses annonces et achats

### 3. Processus d'achat
1. **Sélectionner un produit** dans la marketplace
2. **Cliquer sur "Acheter maintenant (CCTP V2)"**
3. **Configurer le paiement :**
   - Choisir la chaîne source (avec solde USDC)
   - Choisir la chaîne de destination
   - Voir l'estimation des frais
4. **Prévisualisation ERC-7730 :**
   - Description claire de la transaction
   - Détails du transfert
   - Points de sécurité
5. **Exécution :**
   - Approbation USDC (si nécessaire)
   - Transfert CCTP avec suivi temps réel
   - Attestation Circle automatique
   - Finalisation sur chaîne de destination

### 4. Vérification World ID
- Cliquer sur "Vérifier avec World ID"
- Scanner le QR code avec l'app World ID
- Confirmer la vérification
- Profil marqué comme "Vérifié"

---

## 🔧 Développement et Personnalisation

### Ajouter une nouvelle chaîne CCTP
1. **Mettre à jour `src/lib/wagmi.ts` :**
```typescript
import { newChain } from "wagmi/chains";

export const config = getDefaultConfig({
  chains: [...existingChains, newChain],
});

export const CCTP_SUPPORTED_CHAINS = [
  ...existingChains,
  12345, // ID de la nouvelle chaîne
];
```

2. **Configurer CCTP dans `src/lib/cctp.ts` :**
```typescript
const CCTP_DOMAINS = {
  12345: 8, // Nouveau domaine CCTP
};

const USDC_ADDRESSES = {
  12345: "0x...", // Adresse USDC sur la nouvelle chaîne
};
```

### Personnaliser les métadonnées ERC-7730
Modifier `src/lib/erc7730.ts` pour ajouter de nouveaux types de transactions :

```typescript
export function generateTransactionMetadata(
  type: "purchase" | "newType",
  params: any
): ERC7730Metadata {
  switch (type) {
    case "newType":
      return {
        context: { /* ... */ },
        metadata: {
          displayName: "Nouvelle Action",
          description: "Description de la nouvelle action"
        }
      };
  }
}
```

### Ajouter de nouveaux composants
Structure recommandée :
```
src/components/
├── ui/              # Composants UI de base
├── marketplace/     # Composants marketplace
├── payment/         # Composants paiement
└── common/          # Composants communs
```

---

## 🐛 Dépannage

### Problèmes courants

#### 1. Erreur `indexedDB is not defined`
**Cause :** Problème SSR avec WalletConnect
**Solution :** Vérifier que les providers sont bien configurés côté client

#### 2. Erreur de connexion base de données
**Cause :** Port PostgreSQL occupé
**Solution :** 
- Vérifier que Docker fonctionne : `docker ps`
- Changer le port dans `docker-compose.yml` et `.env`

#### 3. Erreur CCTP "Chain not supported"
**Cause :** Chaîne non configurée
**Solution :** Vérifier `CCTP_SUPPORTED_CHAINS` dans `wagmi.ts`

#### 4. Problème World ID
**Cause :** Configuration incorrecte
**Solution :** Vérifier `NEXT_PUBLIC_WLD_APP_ID` dans `.env`

### Logs utiles
```bash
# Logs Docker PostgreSQL
docker logs lebonkoin-db

# Logs application Next.js
# Visibles dans le terminal où npm run dev est lancé

# Logs base de données
npx prisma studio
```

---

## 🚀 Déploiement

### Environnement de production
1. **Configurer les variables d'environnement**
2. **Construire l'application :** `npm run build`
3. **Déployer sur Vercel/Netlify**
4. **Configurer la base de données PostgreSQL**

### Checklist de déploiement
- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL accessible
- [ ] Domaines CCTP configurés pour mainnet
- [ ] World ID configuré pour production
- [ ] Tests de paiement effectués

---

## 📞 Support

### Ressources utiles
- [Documentation CCTP](https://developers.circle.com/stablecoins/docs)
- [Documentation ERC-7730](https://eips.ethereum.org/EIPS/eip-7730)
- [Documentation World ID](https://docs.worldcoin.org/id)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)

### Contact
Pour toute question technique, consulter :
- Les logs de l'application
- La documentation des APIs utilisées
- Les issues GitHub du projet

---

## 🎯 Conclusion

LeBonKoin démontre l'avenir du e-commerce décentralisé en combinant :
- **Simplicité** : Interface intuitive pour les utilisateurs
- **Sécurité** : Signatures transparentes et vérification d'identité
- **Interopérabilité** : Paiements cross-chain seamless
- **Performance** : Architecture moderne et scalable

Le projet est prêt pour une utilisation en production et peut être étendu avec de nouvelles fonctionnalités selon les besoins. 