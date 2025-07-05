# 🧪 Guide de Test CCTP - LeBonKoin Marketplace

## 💰 Obtenir des tokens testnet GRATUITS

### 1. USDC Testnet (Circle Faucet)
**URL :** https://faucet.circle.com

**Réseaux supportés :**
- ✅ Ethereum Sepolia : 10 USDC/heure
- ✅ Base Sepolia : 10 USDC/heure  
- ✅ Avalanche Fuji : 10 USDC/heure
- ✅ Arbitrum Sepolia : 10 USDC/heure
- ✅ Linea Sepolia : 10 USDC/heure

**Instructions :**
1. Connectez votre wallet MetaMask
2. Sélectionnez le réseau souhaité
3. Collez votre adresse wallet : `0x0813c67B88F1DC95a6e684Cf3BAf4b9A423A9Eb7`
4. Cliquez "Send 10 USDC"
5. Attendez 1 heure entre chaque demande

### 2. Tokens natifs pour les frais de gas

#### Ethereum Sepolia ETH
- **Chainlink Faucet :** https://faucets.chain.link/sepolia
- **Montant :** 0.5 ETH
- **Alternative :** https://sepolia-faucet.pk910.de/

#### Base Sepolia ETH  
- **Chainlink Faucet :** https://faucets.chain.link/base-sepolia
- **Montant :** 0.5 ETH

#### Avalanche Fuji AVAX
- **Chainlink Faucet :** https://faucets.chain.link/fuji
- **Montant :** 0.5 AVAX
- **Alternative :** https://faucet.avax.network/

#### Arbitrum Sepolia ETH
- **Chainlink Faucet :** https://faucets.chain.link/arbitrum-sepolia
- **Montant :** 0.5 ETH

#### Linea Sepolia ETH
- **Infura Faucet :** https://faucet.linea.build/
- **Montant :** Variable

## 🧪 Plan de test étape par étape

### Étape 1 : Préparer votre wallet
```bash
# Votre adresse wallet actuelle
0x0813c67B88F1DC95a6e684Cf3BAf4b9A423A9Eb7
```

### Étape 2 : Obtenir des tokens (dans l'ordre)
1. **ETH Sepolia** → [Faucet Chainlink](https://faucets.chain.link/sepolia)
2. **USDC Sepolia** → [Circle Faucet](https://faucet.circle.com)
3. **AVAX Fuji** → [Faucet Chainlink](https://faucets.chain.link/fuji)
4. **USDC Fuji** → [Circle Faucet](https://faucet.circle.com)

### Étape 3 : Tester le transfert CCTP
1. **Ouvrez votre marketplace LeBonKoin**
2. **Naviguez vers une annonce** (ex: http://localhost:3000/marketplace/1)
3. **Cliquez "Acheter maintenant (CCTP V2)"**
4. **Configurez le transfert :**
   - Source : Ethereum Sepolia (où vous avez de l'USDC)
   - Destination : Avalanche Fuji
   - Montant : 1 USDC (pour test)
5. **Suivez le processus :**
   - ✅ Approbation USDC
   - ✅ Burn sur Sepolia
   - ✅ Attestation Circle
   - ✅ Mint sur Fuji

### Étape 4 : Vérifier la réception
- **Avant :** USDC Sepolia = 10, USDC Fuji = 0
- **Après :** USDC Sepolia = 9, USDC Fuji = 1

## 🎯 Scénarios de test recommandés

### Test 1 : Transfert basique Sepolia → Fuji
- **Montant :** 1 USDC
- **Temps estimé :** 2-5 minutes
- **Coût :** ~$0.50 en gas testnet

### Test 2 : Transfert Base → Arbitrum  
- **Montant :** 2 USDC
- **Temps estimé :** 1-3 minutes
- **Coût :** ~$0.30 en gas testnet

### Test 3 : Multi-chaînes (5 réseaux)
- **Distribuer :** 2 USDC sur chaque réseau
- **Tester :** Tous les transferts croisés
- **Temps total :** 30 minutes

## 🚨 Points d'attention

### ✅ SÉCURISÉ (Testnet only)
- ❌ **Aucune valeur réelle**
- ❌ **Tokens gratuits illimités**
- ❌ **Risque financier = 0**
- ✅ **Environnement d'apprentissage**

### 🔍 Suivi des transactions
- **Explorer Sepolia :** https://sepolia.etherscan.io/
- **Explorer Fuji :** https://testnet.snowtrace.io/
- **Explorer Base :** https://base-sepolia.blockscout.com/
- **Circle API :** https://iris-api-sandbox.circle.com/

### 📊 Métriques à surveiller
1. **Temps de transfert** (2-5 minutes attendu)
2. **Frais de gas** (quelques cents en testnet)
3. **Taux de réussite** (doit être 100%)
4. **Signature ERC-7730** (descriptions claires)

## 💡 Astuces pour le hackathon

### Optimiser les tests
1. **Commencez par Sepolia** (plus stable)
2. **Testez les petits montants** (1-2 USDC)
3. **Documentez chaque étape** (pour la démo)
4. **Capturez les screenshots** (pour le pitch)

### Démo parfaite
1. **Préparez plusieurs wallets** avec des tokens
2. **Testez le flow complet** plusieurs fois
3. **Préparez des scénarios d'erreur** (solde insuffisant)
4. **Documentez la signature transparente** ERC-7730

## 🎮 Commandes utiles

### Vérifier les soldes
```bash
# Dans la console du navigateur
console.log('Soldes USDC:', window.usdcBalances);
```

### Restart serveur si besoin
```bash
npm run dev
```

### Build pour production
```bash
npm run build
npm start
```

---

## 🏆 Résultat attendu

Après ces tests, vous devriez avoir :
- ✅ **Système CCTP fonctionnel** sur 5 blockchains
- ✅ **Signature transparente** ERC-7730 opérationnelle  
- ✅ **Marketplace sécurisée** avec World ID
- ✅ **Documentation complète** pour le hackathon
- ✅ **Démo prête** pour les bounties ($8,000)

**🎯 Votre projet sera 100% fonctionnel sans aucun risque financier !** 