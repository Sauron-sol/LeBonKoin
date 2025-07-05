# 📚 Documentation LeBonKoin

Bienvenue dans la documentation complète de **LeBonKoin**, la première marketplace décentralisée cross-chain !

## 📋 Table des Matières

### 🎯 Pour Commencer
- [**Guide de Fonctionnement**](./GUIDE_FONCTIONNEMENT.md) - Comment fonctionne LeBonKoin étape par étape
- [**Guide Utilisateur**](./GUIDE_UTILISATEUR.md) - Manuel d'utilisation pour les utilisateurs finaux

### 🏗️ Documentation Technique
- [**Architecture Technique**](./ARCHITECTURE_TECHNIQUE.md) - Architecture complète du système
- [**Guide Pages Frontend**](./GUIDE_PAGES_FRONTEND.md) - Documentation des pages d'accueil et marketplace

---

## 🚀 Démarrage Rapide

### 1. Installation
```bash
# Cloner le repository
git clone <repository-url>
cd lebonkoin-app

# Installer les dépendances
npm install

# Configurer Docker
export PATH="/c/Program Files/Docker/Docker/resources/bin:$PATH"
docker-compose up -d postgres

# Configurer la base de données
npx prisma generate
npx prisma db push
npm run db:seed

# Lancer l'application
npm run dev
```

### 2. Accès
- **Application** : http://localhost:3000
- **Base de données** : PostgreSQL sur port 5433
- **Documentation** : Ce dossier DOC/

---

## 📖 Guides par Audience

### 👥 Utilisateurs Finaux
- **Nouveaux utilisateurs** → [Guide Utilisateur](./GUIDE_UTILISATEUR.md)
- **Premiers achats** → [Guide Utilisateur - Paiements](./GUIDE_UTILISATEUR.md#effectuer-un-paiement-cross-chain)
- **Vérification World ID** → [Guide Utilisateur - World ID](./GUIDE_UTILISATEUR.md#vérification-world-id)

### 👨‍💻 Développeurs
- **Architecture générale** → [Architecture Technique](./ARCHITECTURE_TECHNIQUE.md)
- **Services CCTP** → [Architecture - Service CCTP](./ARCHITECTURE_TECHNIQUE.md#service-cctp)
- **ERC-7730** → [Architecture - Service ERC-7730](./ARCHITECTURE_TECHNIQUE.md#service-erc-7730)

### 🔧 DevOps / Administrateurs
- **Déploiement** → [Architecture - Déploiement](./ARCHITECTURE_TECHNIQUE.md#déploiement)
- **Monitoring** → [Architecture - Monitoring](./ARCHITECTURE_TECHNIQUE.md#monitoring)
- **Sécurité** → [Architecture - Sécurité](./ARCHITECTURE_TECHNIQUE.md#sécurité)

---

## 🎯 Fonctionnalités Principales

### 🔄 Paiements Cross-Chain (CCTP V2)
- **Transferts USDC natifs** entre 5 blockchains
- **Attestations Circle** automatiques
- **Suivi en temps réel** des transactions
- **Frais optimisés** pour chaque réseau

### 🔍 Signature Transparente (ERC-7730)
- **Descriptions claires** des transactions
- **Métadonnées JSON** conformes au standard
- **Compatible Ledger** et autres wallets
- **Points de sécurité** automatiques

### 🌍 Vérification World ID
- **Prévention des bots** et faux comptes
- **Amélioration de la réputation** utilisateur
- **Intégration seamless** avec l'écosystème Worldcoin

### 🛒 Marketplace Complète
- **Interface moderne** avec Next.js 15
- **Base de données PostgreSQL** avec Prisma
- **Recherche avancée** avec filtres
- **Responsive design** mobile-first

---

## 🔧 Technologies Utilisées

### Frontend
- **Next.js 15** - Framework React avec SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling utility-first
- **RainbowKit** - Interface wallet

### Backend
- **PostgreSQL** - Base de données relationnelle
- **Prisma** - ORM type-safe
- **Docker** - Containerisation

### Blockchain
- **Wagmi** - Hooks React pour Ethereum
- **Viem** - Client Ethereum type-safe
- **Ethers.js** - Interactions blockchain

---

## 🛡️ Sécurité

### Authentification
- **Signature wallet** pour l'authentification
- **World ID** pour la vérification d'identité
- **Middleware de sécurité** pour les API

### Paiements
- **CCTP natif** pour les transferts sécurisés
- **ERC-7730** pour la transparence
- **Validation** des transactions côté client et serveur

### Données
- **Chiffrement** des données sensibles
- **Validation** avec schémas Zod
- **Rate limiting** pour prévenir les abus

---

## 📊 Métriques et Performance

### Optimisations
- **Lazy loading** des composants
- **Mise en cache** des requêtes
- **Index** optimisés en base de données
- **CDN** pour les assets statiques

### Monitoring
- **Logs structurés** avec Winston
- **Métriques** personnalisées
- **Health checks** automatiques
- **Error tracking** avec Sentry

---

## 🆘 Support et Dépannage

### Problèmes Courants
1. **Erreur `indexedDB is not defined`** → Problème SSR avec WalletConnect
2. **Erreur de connexion DB** → Vérifier Docker et ports
3. **Erreur CCTP** → Vérifier les réseaux supportés
4. **Problème World ID** → Vérifier la configuration

### Ressources
- **Logs** : `docker logs lebonkoin-db`
- **Base de données** : `npx prisma studio`
- **Métriques** : `http://localhost:3000/api/metrics`

---

## 🚀 Roadmap

### Phase 1 - MVP ✅
- [x] Marketplace de base
- [x] Paiements CCTP V2
- [x] Signature ERC-7730
- [x] Vérification World ID

### Phase 2 - Améliorations
- [ ] NFT Receipts
- [ ] Smart Contracts Escrow
- [ ] Multi-token Support
- [ ] Mobile App

### Phase 3 - Écosystème
- [ ] DAO Governance
- [ ] API Publique
- [ ] Intégrations Partenaires
- [ ] Mainnet Launch

---

## 📞 Contact

### Équipe Technique
- **Documentation** : Ce dossier DOC/
- **Code Source** : Repository GitHub
- **Issues** : GitHub Issues

### Communauté
- **Discord** : Communauté développeurs
- **Telegram** : Annonces et support
- **Twitter** : Actualités du projet

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

## 🎉 Contribution

Les contributions sont les bienvenues ! Consultez le guide de contribution pour commencer.

### Comment Contribuer
1. **Fork** le repository
2. **Créer** une branche feature
3. **Commit** vos changements
4. **Push** vers la branche
5. **Créer** une Pull Request

---

**Merci d'utiliser LeBonKoin ! 🚀** 