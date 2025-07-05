import { useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Address, parseUnits, encodeFunctionData, encodeAbiParameters } from 'viem';
import { 
  arbitrumSepolia, 
  sepolia, 
  baseSepolia, 
  optimismSepolia,
  polygonAmoy
} from 'viem/chains';
import { createSmartAccount, SmartAccount } from '../lib/smartAccount';
import { isChainSupported as checkBundlerSupport, CIRCLE_PAYMASTER_ADDRESSES } from '../lib/bundler';
import { CIRCLE_PAYMASTER_ADDRESSES as DEPLOYED_ADDRESSES } from '../lib/paymaster-config';

const CHAINS_MAP = {
  [sepolia.id]: sepolia,
  [arbitrumSepolia.id]: arbitrumSepolia,
  [baseSepolia.id]: baseSepolia,
  [optimismSepolia.id]: optimismSepolia,
  [polygonAmoy.id]: polygonAmoy,
};

// Mode test : utiliser un paymaster mock ou pas de paymaster
const TEST_MODE = false;

interface PaymasterState {
  smartAccount: SmartAccount | null;
  smartAccountAddress: Address | null;
  isGaslessMode: boolean;
  isLoading: boolean;
  error: string | null;
  supportedChains: number[];
  lastTransactionHash: string | null;
  isTestMode: boolean;
}

export function useCirclePaymaster() {
  const { address } = useAccount();
  const chainId = useChainId();
  
  const [state, setState] = useState<PaymasterState>({
    smartAccount: null,
    smartAccountAddress: null,
    isGaslessMode: false,
    isLoading: false,
    error: null,
    supportedChains: [sepolia.id, arbitrumSepolia.id, baseSepolia.id, optimismSepolia.id, polygonAmoy.id],
    lastTransactionHash: null,
    isTestMode: TEST_MODE
  });

  // Vérifier si la chaîne est supportée
  const isChainSupported = useCallback((chainId: number) => {
    return checkBundlerSupport(chainId);
  }, []);

  // Générer une clé privée déterministe basée sur l'adresse utilisateur
  const generateOwnerKey = useCallback((userAddress: Address): `0x${string}` => {
    // En production, utiliser une méthode plus sécurisée
    // Ici on génère de manière déterministe pour la démo
    const seed = userAddress.toLowerCase();
    const hash = Array.from(seed).reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Convertir en hex de 64 caractères
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `0x${hex.repeat(8).slice(0, 64)}` as `0x${string}`;
  }, []);

  // Initialiser le smart account
  const initializeSmartAccount = useCallback(async () => {
    if (!address || !isChainSupported(chainId)) {
      setState(prev => ({ ...prev, error: 'Chaîne non supportée pour ERC-4337' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const chain = CHAINS_MAP[chainId as keyof typeof CHAINS_MAP];
      if (!chain) throw new Error('Configuration chaîne manquante');

      // Créer le smart account avec une clé privée déterministe
      const ownerPrivateKey = generateOwnerKey(address);
      const smartAccount = createSmartAccount({
        ownerPrivateKey,
        salt: BigInt(0), // Salt fixe pour avoir toujours la même adresse
        chainId,
        chain
      });

      const smartAccountAddress = await smartAccount.getAddress();
      
      setState(prev => ({ 
        ...prev, 
        smartAccount,
        smartAccountAddress,
        isLoading: false 
      }));

      console.log('✅ Smart Account ERC-4337 initialisé:', {
        address: smartAccountAddress,
        chainId,
        isDeployed: await smartAccount.isDeployed()
      });

      return smartAccount;
    } catch (error) {
      console.error('❌ Erreur initialisation smart account:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erreur initialisation ERC-4337',
        isLoading: false 
      }));
      throw error;
    }
  }, [address, chainId, isChainSupported, generateOwnerKey]);

  // Activer le mode gasless
  const enableGaslessMode = useCallback(async () => {
    try {
      let smartAccount: SmartAccount | null = state.smartAccount;
      
      if (!smartAccount) {
        smartAccount = await initializeSmartAccount() || null;
        if (!smartAccount) throw new Error('Impossible d\'initialiser le smart account');
      }
      
      setState(prev => ({ ...prev, isGaslessMode: true }));
      
      console.log('✅ Mode gasless ERC-4337 activé');
      return smartAccount;
    } catch (error) {
      console.error('❌ Erreur activation gasless:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erreur activation gasless'
      }));
      throw error;
    }
  }, [state.smartAccount, initializeSmartAccount]);

  // Générer les données du Circle Paymaster
  const generatePaymasterAndData = useCallback((
    userAddress: Address,
    usdcAmount: bigint,
    chainId: number
  ): `0x${string}` => {
    if (TEST_MODE) {
      // Mode test : pas de paymaster
      return '0x';
    }
    
    // Vérifier si on a un paymaster déployé (notre test) ou officiel (Circle)
    const deployedPaymaster = DEPLOYED_ADDRESSES[chainId as keyof typeof DEPLOYED_ADDRESSES];
    const officialPaymaster = CIRCLE_PAYMASTER_ADDRESSES[chainId as keyof typeof CIRCLE_PAYMASTER_ADDRESSES];
    
    const paymasterAddress = deployedPaymaster || officialPaymaster;
    
    if (!paymasterAddress) {
      console.warn(`❌ Pas de Circle Paymaster disponible pour la chaîne ${chainId}`);
      console.warn(`💡 Circle Paymaster officiel disponible sur: Arbitrum, Base`);
      console.warn(`🧪 Notre paymaster de test disponible sur: Sepolia`);
      return '0x';
    }
    
    // Format selon Circle Paymaster officiel
    if (officialPaymaster && chainId !== sepolia.id) {
      console.log('🏢 Utilisation Circle Paymaster officiel');
      
      // Format officiel Circle (selon leur documentation)
      const maxUsdcFee = parseUnits('0.01', 6); // 0.01 USDC max pour les frais
      
      const paymasterData = encodeAbiParameters(
        [
          { name: 'maxCost', type: 'uint256' },
          { name: 'validUntil', type: 'uint48' },
          { name: 'validAfter', type: 'uint48' },
          { name: 'signature', type: 'bytes' }
        ],
        [
          maxUsdcFee,
          Math.floor(Date.now() / 1000) + 3600, // Valide 1 heure
          Math.floor(Date.now() / 1000), // Valide maintenant
          '0x' // Signature vide pour les tests
        ]
      );
      
      return `${paymasterAddress}${paymasterData.slice(2)}` as `0x${string}`;
    }
    
    // Format pour notre paymaster de test sur Sepolia
    console.log('🧪 Utilisation de notre paymaster de test');
    
    // Notre nouveau paymaster simplifié n'a pas besoin de données supplémentaires
    // Il récupère tout depuis la UserOperation directement
    return paymasterAddress as `0x${string}`;
  }, []);

  // Effectuer un paiement gasless avec vraie UserOperation
  const performGaslessPayment = useCallback(async (params: {
    to: Address;
    amount: string;
    tokenAddress: Address;
  }) => {
    if (!state.smartAccount || !state.isGaslessMode) {
      throw new Error('Mode gasless non activé');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { to, amount, tokenAddress } = params;
      const usdcAmount = parseUnits(amount, 6); // USDC a 6 décimales
      
      console.log('🚀 Création UserOperation ERC-4337...', {
        from: state.smartAccountAddress,
        to,
        amount,
        token: tokenAddress
      });
      
      // Créer le callData pour le transfert USDC
      const transferData = encodeFunctionData({
        abi: [
          {
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            name: 'transfer',
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function'
          }
        ],
        functionName: 'transfer',
        args: [to, usdcAmount]
      });
      
      // Générer paymasterAndData
      const paymasterAndData = generatePaymasterAndData(
        state.smartAccountAddress!,
        usdcAmount,
        chainId
      );
      
      if (TEST_MODE) {
        console.log('🧪 Mode test activé - simulation sans paymaster');
        
        // En mode test, on simule le paiement sans utiliser de paymaster
        const userOp = await state.smartAccount.createUserOperation({
          to: tokenAddress,
          data: transferData,
          value: BigInt(0),
          paymasterAndData: '0x' // Pas de paymaster en mode test
        });
        
        // Envoyer la UserOperation
        const userOpHash = await state.smartAccount.sendUserOperation(userOp);
        
        console.log('✅ UserOperation créée en mode test:', userOpHash);
        
        setState(prev => ({ 
          ...prev, 
          lastTransactionHash: userOpHash,
          isLoading: false 
        }));
        
        return userOpHash;
      }
      
      console.log('💰 Circle Paymaster activé:', {
        paymaster: DEPLOYED_ADDRESSES[chainId as keyof typeof DEPLOYED_ADDRESSES],
        user: state.smartAccountAddress,
        usdcAmount: usdcAmount.toString(),
        paymasterAndData
      });
      
      // Vérifier si le Smart Account est déployé
      const isDeployed = await state.smartAccount.isDeployed();
      const paymasterAddress = DEPLOYED_ADDRESSES[chainId as keyof typeof DEPLOYED_ADDRESSES];
      
      if (!isDeployed) {
        console.log('🚀 Première transaction : déploiement + approbation USDC');
        
        // Pour la première transaction, on fait juste l'approbation pour déployer le Smart Account
        const approveData = encodeFunctionData({
          abi: [
            {
              inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' }
              ],
              name: 'approve',
              outputs: [{ name: '', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function'
            }
          ],
          functionName: 'approve',
          args: [paymasterAddress, parseUnits('10', 6)] // Approuver 10 USDC
        });
        
        // Créer une UserOperation simple pour déployer + approuver (sans paymaster)
        const userOp = await state.smartAccount.createUserOperation({
          to: tokenAddress,
          data: approveData,
          value: BigInt(0)
          // Pas de paymaster pour le déploiement + approbation !
        });
        
        // Envoyer la première UserOperation (déploiement + approbation)
        const userOpHash = await state.smartAccount.sendUserOperation(userOp);
        console.log('✅ Smart Account déployé et USDC approuvé:', userOpHash);
        
        // Attendre un peu pour que le déploiement soit confirmé
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Maintenant faire le transfert dans une seconde UserOperation
        console.log('🚀 Seconde transaction : transfert USDC (avec paymaster)');
        
        const transferUserOp = await state.smartAccount.createUserOperation({
          to: tokenAddress,
          data: transferData,
          value: BigInt(0),
          paymasterAndData
        });
        
        const transferHash = await state.smartAccount.sendUserOperation(transferUserOp);
        console.log('✅ Transfert USDC terminé:', transferHash);
        
        setState(prev => ({ 
          ...prev, 
          lastTransactionHash: transferHash,
          isLoading: false 
        }));
        
        return transferHash;
      } else {
        console.log('🚀 Smart Account déjà déployé : approbation puis transfert séparés');
        
        // Même si le Smart Account est déployé, on fait deux transactions séparées
        // car le paymaster vérifie l'allowance avant l'exécution du batch
        
        // 1. D'abord l'approbation USDC
        const approveData = encodeFunctionData({
          abi: [
            {
              inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' }
              ],
              name: 'approve',
              outputs: [{ name: '', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function'
            }
          ],
          functionName: 'approve',
          args: [paymasterAddress, parseUnits('10', 6)]
        });
        
        console.log('🚀 Première transaction : approbation USDC (sans paymaster)');
        const approveUserOp = await state.smartAccount.createUserOperation({
          to: tokenAddress,
          data: approveData,
          value: BigInt(0)
          // Pas de paymaster pour l'approbation !
        });
        
        const approveHash = await state.smartAccount.sendUserOperation(approveUserOp);
        console.log('✅ Approbation USDC envoyée:', approveHash);
        
        // Attendre que l'approbation soit confirmée sur la blockchain
        console.log('⏳ Attente de la confirmation de l\'approbation...');
        await state.smartAccount.waitForUserOperationReceipt(approveHash);
        console.log('✅ Approbation USDC confirmée sur la blockchain !');
        
        // 2. Ensuite le transfert USDC
        console.log('🚀 Seconde transaction : transfert USDC (avec paymaster)');
        const transferUserOp = await state.smartAccount.createUserOperation({
          to: tokenAddress,
          data: transferData,
          value: BigInt(0),
          paymasterAndData
        });
        
        const transferHash = await state.smartAccount.sendUserOperation(transferUserOp);
        console.log('✅ Transfert USDC terminé:', transferHash);
        
        setState(prev => ({ 
          ...prev, 
          lastTransactionHash: transferHash,
          isLoading: false 
        }));
        
        return transferHash;
      }
      
    } catch (error) {
      console.error('❌ Erreur paiement gasless ERC-4337:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erreur paiement gasless',
        isLoading: false 
      }));
      throw error;
    }
  }, [state.smartAccount, state.isGaslessMode, state.smartAccountAddress, chainId, generatePaymasterAndData]);

  // Obtenir le solde du smart account
  const getSmartAccountBalance = useCallback(async (tokenAddress?: Address) => {
    if (!state.smartAccount) return null;
    
    try {
      const smartAccountAddress = await state.smartAccount.getAddress();
      
      if (tokenAddress) {
        // Solde token ERC-20 - utiliser directement viem
        // TODO: Implémenter la lecture du solde ERC-20
        return BigInt(0);
      } else {
        // Solde ETH natif - utiliser directement viem
        // TODO: Implémenter la lecture du solde ETH
        return BigInt(0);
      }
    } catch (error) {
      console.error('Erreur récupération solde:', error);
      return null;
    }
  }, [state.smartAccount]);

  // Vérifier si le smart account est déployé
  const isSmartAccountDeployed = useCallback(async () => {
    if (!state.smartAccount) return false;
    
    try {
      return await state.smartAccount.isDeployed();
    } catch (error) {
      console.error('Erreur vérification déploiement:', error);
      return false;
    }
  }, [state.smartAccount]);

  // Réinitialiser l'état
  const reset = useCallback(() => {
    setState({
      smartAccount: null,
      smartAccountAddress: null,
      isGaslessMode: false,
      isLoading: false,
      error: null,
      supportedChains: [sepolia.id, arbitrumSepolia.id, baseSepolia.id, optimismSepolia.id, polygonAmoy.id],
      lastTransactionHash: null,
      isTestMode: TEST_MODE
    });
  }, []);

  // Effet pour réinitialiser quand l'utilisateur change
  useEffect(() => {
    if (!address) {
      reset();
    }
  }, [address, reset]);

  // Vérifier et approuver l'USDC pour le Circle Paymaster
  const ensureUsdcAllowance = useCallback(async (
    usdcAddress: Address,
    paymasterAddress: Address,
    amount: bigint
  ) => {
    if (!state.smartAccount) {
      throw new Error('Smart Account non initialisé');
    }

    try {
      // Vérifier l'allowance actuelle
      // Note: En production, il faudrait implémenter cette vérification
      // Pour l'instant, on assume que l'allowance est suffisante
      console.log('🔍 Vérification allowance USDC pour Circle Paymaster...', {
        usdc: usdcAddress,
        paymaster: paymasterAddress,
        amount: amount.toString()
      });

      // Si l'allowance est insuffisante, créer une transaction d'approbation
      // Cela nécessiterait une UserOperation séparée pour approve()
      
      return true;
    } catch (error) {
      console.error('❌ Erreur vérification allowance USDC:', error);
      throw error;
    }
  }, [state.smartAccount]);

  return {
    // État
    ...state,
    
    // Actions
    initializeSmartAccount,
    enableGaslessMode,
    performGaslessPayment,
    getSmartAccountBalance,
    isSmartAccountDeployed,
    reset,
    
    // Utilitaires
    isChainSupported,
    generatePaymasterAndData,
    ensureUsdcAllowance
  };
}

// Hook pour vérifier la compatibilité paymaster
export function usePaymasterCompatibility() {
  const chainId = useChainId();
  
  const isPaymasterSupported = useCallback(() => {
    return chainId in CIRCLE_PAYMASTER_ADDRESSES;
  }, [chainId]);
  
  const getPaymasterAddress = useCallback(() => {
    return CIRCLE_PAYMASTER_ADDRESSES[chainId as keyof typeof CIRCLE_PAYMASTER_ADDRESSES];
  }, [chainId]);
  
  return {
    isPaymasterSupported,
    getPaymasterAddress,
    supportedChains: Object.keys(CIRCLE_PAYMASTER_ADDRESSES).map(Number)
  };
} 