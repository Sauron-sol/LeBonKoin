import { useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Address, parseUnits, encodeFunctionData } from 'viem';
import { 
  arbitrumSepolia, 
  sepolia, 
  baseSepolia, 
  optimismSepolia,
  polygonAmoy
} from 'viem/chains';
import { createSmartAccount, SmartAccount } from '../lib/smartAccount';
import { isChainSupported as checkBundlerSupport } from '../lib/bundler';

const CHAINS_MAP = {
  [sepolia.id]: sepolia,
  [arbitrumSepolia.id]: arbitrumSepolia,
  [baseSepolia.id]: baseSepolia,
  [optimismSepolia.id]: optimismSepolia,
  [polygonAmoy.id]: polygonAmoy,
};

interface PaymasterState {
  smartAccount: SmartAccount | null;
  smartAccountAddress: Address | null;
  isGaslessMode: boolean;
  isLoading: boolean;
  error: string | null;
  supportedChains: number[];
  lastTransactionHash: string | null;
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
    lastTransactionHash: null
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
        args: [to, parseUnits(amount, 6)] // USDC a 6 décimales
      });

      // Créer la UserOperation avec Circle Paymaster
      // TODO: Implémenter l'intégration avec le vrai contrat Circle Paymaster
      const userOp = await state.smartAccount.createUserOperation({
        to: tokenAddress,
        value: BigInt(0),
        data: transferData,
        paymasterAndData: '0x' // TODO: Ajouter Circle Paymaster address + data
      });

      console.log('📦 UserOperation créée:', {
        sender: userOp.sender,
        nonce: userOp.nonce.toString(),
        callGasLimit: userOp.callGasLimit.toString(),
        verificationGasLimit: userOp.verificationGasLimit.toString(),
        preVerificationGas: userOp.preVerificationGas.toString(),
        initCode: userOp.initCode.slice(0, 20) + '...',
        callData: userOp.callData.slice(0, 20) + '...'
      });

      // Envoyer la UserOperation au bundler
      const userOpHash = await state.smartAccount.sendUserOperation(userOp);
      console.log('📡 UserOperation envoyée au bundler:', userOpHash);

      // Attendre la confirmation
      console.log('⏳ Attente confirmation UserOperation...');
      const receipt = await state.smartAccount.waitForUserOperationReceipt(userOpHash);
      console.log('✅ UserOperation confirmée:', receipt);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        lastTransactionHash: receipt.transactionHash || userOpHash
      }));
      
      return userOpHash;
    } catch (error) {
      console.error('❌ Erreur paiement gasless ERC-4337:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erreur paiement gasless ERC-4337',
        isLoading: false 
      }));
      throw error;
    }
  }, [state.smartAccount, state.isGaslessMode, state.smartAccountAddress]);

  // Vérifier le déploiement du smart account
  const checkDeployment = useCallback(async () => {
    if (!state.smartAccount) return false;
    return state.smartAccount.isDeployed();
  }, [state.smartAccount]);

  // Obtenir le nonce du smart account
  const getNonce = useCallback(async () => {
    if (!state.smartAccount) return BigInt(0);
    return state.smartAccount.getNonce();
  }, [state.smartAccount]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialiser automatiquement si l'adresse change
  useEffect(() => {
    if (address && isChainSupported(chainId)) {
      initializeSmartAccount();
    }
  }, [address, chainId, isChainSupported, initializeSmartAccount]);

  return {
    // State
    smartAccount: state.smartAccount,
    smartAccountAddress: state.smartAccountAddress,
    isGaslessMode: state.isGaslessMode,
    isLoading: state.isLoading,
    error: state.error,
    supportedChains: state.supportedChains,
    lastTransactionHash: state.lastTransactionHash,
    
    // Actions
    isChainSupported,
    initializeSmartAccount,
    enableGaslessMode,
    performGaslessPayment,
    checkDeployment,
    getNonce,
    clearError
  };
}

// Hook de compatibilité pour vérifier le support ERC-4337
export function usePaymasterCompatibility() {
  const chainId = useChainId();
  
  return {
    isSupported: checkBundlerSupport(chainId),
    supportedChains: [sepolia.id, arbitrumSepolia.id, baseSepolia.id, optimismSepolia.id, polygonAmoy.id],
    currentChain: chainId,
    bundlerAvailable: checkBundlerSupport(chainId),
    erc4337Support: true,
    circlePaymasterDeployed: false // TODO: Vérifier si Circle Paymaster est déployé
  };
} 