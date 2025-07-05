'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useChains } from 'wagmi';
import { sepolia } from 'viem/chains';
import { useCirclePaymaster, usePaymasterCompatibility } from '../hooks/useCirclePaymaster';
import { CCTP_CONTRACTS } from '../lib/cctp';
import { isChainSupported as checkBundlerSupport } from '../lib/bundler';

interface GaslessPaymentProps {
  recipientAddress: string;
  amount: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export default function GaslessPayment({ 
  recipientAddress, 
  amount, 
  onSuccess, 
  onError 
}: GaslessPaymentProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const chains = useChains();
  const chain = chains.find(c => c.id === chainId);
  
  // Hook Circle Paymaster avec vraie intégration ERC-4337
  const {
    smartAccount,
    smartAccountAddress,
    isGaslessMode,
    isLoading: paymasterLoading,
    error: paymasterError,
    lastTransactionHash,
    initializeSmartAccount,
    enableGaslessMode,
    performGaslessPayment,
    isSmartAccountDeployed,
    reset,
    isChainSupported
  } = useCirclePaymaster();

  // Hook de compatibilité
  const {
    isPaymasterSupported,
    supportedChains
  } = usePaymasterCompatibility();

  const [step, setStep] = useState<'connect' | 'init' | 'enable' | 'ready' | 'payment'>('connect');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDeployed, setIsDeployed] = useState(false);

  const error = paymasterError || localError;
  const isLoading = paymasterLoading;

  // Vérifier le déploiement du smart account
  useEffect(() => {
    if (smartAccount) {
      isSmartAccountDeployed().then(setIsDeployed);
    }
  }, [smartAccount, isSmartAccountDeployed]);

  // Déterminer l'étape actuelle
  useEffect(() => {
    if (!isConnected) {
      setStep('connect');
    } else if (!smartAccount) {
      setStep('init');
    } else if (!isGaslessMode) {
      setStep('enable');
    } else {
      setStep('ready');
    }
  }, [isConnected, smartAccount, isGaslessMode]);

  // Debug: Afficher les informations de chaîne
  useEffect(() => {
    console.log('🔍 Debug chaîne:', {
      chainId,
      chainName: chain?.name,
      isSupported: isChainSupported(chainId),
      bundlerSupported: checkBundlerSupport(chainId),
      sepoliaId: sepolia.id,
      currentChainMatchesSepolia: chainId === sepolia.id
    });
  }, [chainId, chain, isChainSupported]);

  const clearError = () => {
    setLocalError(null);
  };

  const handleSwitchToSupportedChain = async () => {
    try {
      await switchChain({ chainId: 11155111 }); // Ethereum Sepolia
    } catch (error) {
      console.error('Erreur changement de chaîne:', error);
      setLocalError('Impossible de changer de chaîne');
    }
  };

  const handleInitializeSmartAccount = async () => {
    try {
      clearError();
      await initializeSmartAccount();
    } catch (error) {
      console.error('Erreur initialisation:', error);
    }
  };

  const handleEnableGaslessMode = async () => {
    try {
      clearError();
      await enableGaslessMode();
    } catch (error) {
      console.error('Erreur activation gasless:', error);
    }
  };

  const handleGaslessPayment = async () => {
    if (!smartAccount || !isGaslessMode) {
      setLocalError('Smart account non initialisé ou mode gasless non activé');
      return;
    }

    setStep('payment');
    clearError();

    try {
      // Obtenir l'adresse du contrat USDC pour cette chaîne
      const contracts = CCTP_CONTRACTS[chainId as keyof typeof CCTP_CONTRACTS];
      if (!contracts) {
        throw new Error(`Contrats USDC non disponibles sur la chaîne ${chainId}`);
      }

      console.log('🚀 Démarrage paiement gasless ERC-4337...', {
        from: smartAccountAddress,
        to: recipientAddress,
        amount,
        usdcContract: contracts.usdc
      });

      const userOpHash = await performGaslessPayment({
        to: recipientAddress as `0x${string}`,
        amount,
        tokenAddress: contracts.usdc as `0x${string}`
      });

      console.log('✅ Paiement gasless réussi:', userOpHash);

      if (onSuccess) {
        onSuccess(userOpHash);
      }

      setStep('ready'); // Retour à l'état prêt
    } catch (error) {
      console.error('❌ Erreur paiement gasless:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur de paiement gasless';
      setLocalError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      setStep('ready'); // Retour à l'état prêt même en cas d'erreur
    }
  };

  // Interface si wallet non connecté
  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            Connexion Wallet Requise
          </h3>
          <p className="text-blue-700 mb-4">
            Connectez votre wallet pour utiliser le paiement gasless ERC-4337
          </p>
          <div className="text-center">
            <p className="text-sm text-blue-600">Utilisez le bouton de connexion wallet en haut de la page</p>
          </div>
        </div>
      </div>
    );
  }

  // Interface si chaîne non supportée
  if (!isChainSupported(chainId)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">
              Chaîne non supportée pour ERC-4337
            </h3>
            <p className="text-sm text-red-600 mt-1">
              Circle Paymaster + Bundler non disponible sur la chaîne {chainId}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-red-700 mb-2">Chaînes supportées avec bundlers ERC-4337 :</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-red-600">• Ethereum Sepolia</div>
            <div className="text-red-600">• Arbitrum Sepolia</div>
            <div className="text-red-600">• Base Sepolia</div>
            <div className="text-red-600">• Optimism Sepolia</div>
            <div className="text-red-600">• Polygon Amoy</div>
          </div>
        </div>

        <button
          onClick={handleSwitchToSupportedChain}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Passer à Ethereum Sepolia
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0">
          <span className="text-3xl">⚡</span>
        </div>
        <div className="ml-3">
          <h3 className="text-xl font-bold text-purple-900">
            Paiement Gasless ERC-4337
          </h3>
          <p className="text-sm text-purple-700">
            UserOperations avec Circle Paymaster (frais gas en USDC)
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Informations Smart Account */}
      {smartAccountAddress && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <h4 className="font-medium text-gray-900 mb-3">Smart Account ERC-4337</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Adresse Smart Account:</span>
              <span className="font-mono text-xs">{smartAccountAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Déployé:</span>
              <span className={`font-medium ${isDeployed ? 'text-green-600' : 'text-orange-600'}`}>
                {isDeployed ? '✅ Oui' : '🔄 Non (sera déployé automatiquement)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mode Gasless:</span>
              <span className={`font-medium ${isGaslessMode ? 'text-green-600' : 'text-gray-600'}`}>
                {isGaslessMode ? '✅ Activé' : '❌ Non activé'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Informations de paiement */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Informations de paiement</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Wallet connecté:</span>
            <span className="font-mono text-xs">{address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Chaîne:</span>
            <span className="font-medium">
              {chainId === 11155111 ? 'Ethereum Sepolia' : 
               chainId === 421614 ? 'Arbitrum Sepolia' :
               chainId === 84532 ? 'Base Sepolia' :
               chainId === 11155420 ? 'Optimism Sepolia' :
               chainId === 80002 ? 'Polygon Amoy' :
               `ID: ${chainId}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Destinataire:</span>
            <span className="font-mono text-xs">{recipientAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Montant:</span>
            <span className="font-semibold">{amount} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Frais de gas:</span>
            <span className="text-green-600">Payés en USDC via Paymaster</span>
          </div>
        </div>
      </div>

      {/* Information USDC testnet */}
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">
          💡 Obtenir des USDC testnet
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>1. Faucet officiel Circle : <strong>faucet.circle.com</strong></p>
          <p>2. Connectez {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          <p>3. Obtenez 10 USDC gratuits (répétable toutes les heures)</p>
          <p>4. Transférez vers votre Smart Account : {smartAccountAddress?.slice(0, 6)}...{smartAccountAddress?.slice(-4)}</p>
        </div>
      </div>

      {/* Boutons d'action selon l'étape */}
      <div className="space-y-3">
        {step === 'init' && (
          <button
            onClick={handleInitializeSmartAccount}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            {isLoading ? '⏳ Initialisation...' : '🔧 Initialiser Smart Account'}
          </button>
        )}

        {step === 'enable' && (
          <button
            onClick={handleEnableGaslessMode}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            {isLoading ? '⏳ Activation...' : '⚡ Activer Mode Gasless'}
          </button>
        )}

        {step === 'ready' && (
          <button
            onClick={handleGaslessPayment}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            {isLoading ? '⏳ Paiement en cours...' : '🚀 Exécuter Paiement Gasless'}
          </button>
        )}

        {step === 'payment' && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⏳</span>
              <div>
                <p className="font-medium text-yellow-800">UserOperation en cours...</p>
                <p className="text-sm text-yellow-700">
                  Création, signature et envoi au bundler ERC-4337
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {lastTransactionHash && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800 font-medium">✅ Transaction réussie!</p>
          <p className="text-green-700 text-sm mt-1">
            Hash: <span className="font-mono">{lastTransactionHash}</span>
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Powered by Circle Paymaster + ERC-4337</span>
          <span>
            {checkBundlerSupport(chainId) ? '✅ Bundler disponible' : '❌ Bundler indisponible'}
          </span>
        </div>
      </div>
    </div>
  );
} 