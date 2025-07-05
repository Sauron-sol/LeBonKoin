'use client';

import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useMultichainPayment, MultichainPaymentParams } from '../hooks/useMultichainPayment';
import { erc7730Service } from '../lib/erc7730';
import { SuccessModal } from './SuccessModal';

interface MultichainPaymentProps {
  listingId: string;
  listingTitle: string;
  listingPrice: string; // En USDC
  sellerAddress: `0x${string}`;
  sellerName?: string;
  listingImage?: string;
  onPaymentSuccess?: (txHash: string) => void;
  onPaymentError?: (error: string) => void;
}

interface ChainOption {
  id: number;
  name: string;
  balance: string;
  color: string;
  icon: string;
}

export function MultichainPayment({
  listingId,
  listingTitle,
  listingPrice,
  sellerAddress,
  sellerName,
  listingImage,
  onPaymentSuccess,
  onPaymentError
}: MultichainPaymentProps) {
  const {
    paymentStatus,
    usdcBalances,
    supportedChains,
    isConnected,
    currentChain,
    executePayment,
    resetPayment,
    estimateFees,
    generatePaymentDescription,
    getChainInfo,
    loadUSDCBalances
  } = useMultichainPayment();

  const [selectedSourceChain, setSelectedSourceChain] = useState<number>(11155111); // Ethereum Sepolia par défaut
  const [selectedTargetChain, setSelectedTargetChain] = useState<number>(84532); // Base Sepolia par défaut
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState<string>('');
  const [finalizationStatus, setFinalizationStatus] = useState<'pending' | 'completed' | 'error'>('completed');
  const [estimatedFees, setEstimatedFees] = useState<{
    networkFee: string;
    bridgeFee: string;
    total: string;
  } | null>(null);

  // Chaînes disponibles avec icônes et couleurs (testnets)
  const chainOptions: ChainOption[] = [
    {
      id: 11155111,
      name: 'Ethereum',
      balance: usdcBalances[11155111] || '0',
      color: '#627EEA',
      icon: '⟠'
    },
    {
      id: 84532,
      name: 'Base',
      balance: usdcBalances[84532] || '0',
      color: '#0052FF',
      icon: '🔵'
    },
    {
      id: 421614,
      name: 'Arbitrum',
      balance: usdcBalances[421614] || '0',
      color: '#28A0F0',
      icon: '◈'
    },
    {
      id: 43113,
      name: 'Avalanche',
      balance: usdcBalances[43113] || '0',
      color: '#E84142',
      icon: '🔺'
    },
    {
      id: 59141,
      name: 'Linea',
      balance: usdcBalances[59141] || '0',
      color: '#121212',
      icon: '▢'
    }
  ];

  // Charger les frais estimés
  useEffect(() => {
    if (selectedSourceChain && selectedTargetChain) {
      estimateFees(selectedSourceChain, selectedTargetChain, listingPrice)
        .then(setEstimatedFees)
        .catch(console.error);
    }
  }, [selectedSourceChain, selectedTargetChain, listingPrice, estimateFees]);

  // État pour la description ERC-7730
  const [transactionPreview, setTransactionPreview] = useState<any>(null);

  // Générer la description ERC-7730 pour prévisualisation
  useEffect(() => {
    if (!isConnected) {
      setTransactionPreview(null);
      return;
    }

    const loadTransactionPreview = async () => {
      const params: MultichainPaymentParams = {
        listingId,
        amount: listingPrice,
        sourceChain: selectedSourceChain,
        targetChain: selectedTargetChain,
        sellerAddress,
        listingData: {
          title: listingTitle,
          category: 'Marketplace'
        }
      };

      try {
        const preview = await generatePaymentDescription(params, selectedSourceChain);
        setTransactionPreview(preview);
      } catch (error) {
        console.error('Erreur génération preview ERC-7730:', error);
        setTransactionPreview(null);
      }
    };

    loadTransactionPreview();
  }, [isConnected, selectedSourceChain, selectedTargetChain, listingPrice, generatePaymentDescription, listingId, listingTitle, sellerAddress]);

  // Gérer le paiement
  const handlePayment = async () => {
    try {
      const params: MultichainPaymentParams = {
        listingId,
        amount: listingPrice,
        sourceChain: selectedSourceChain, // ✅ Ajout de la chaîne source sélectionnée
        targetChain: selectedTargetChain,
        sellerAddress,
        listingData: {
          title: listingTitle,
          category: 'Marketplace'
        }
      };

      const txHash = await executePayment(params);
      
      // 🎉 Afficher le modal de succès au lieu de juste appeler le callback
      setSuccessTxHash(txHash);
      
      // Déterminer le statut de finalisation
      const finalizeStep = paymentStatus.steps.find(step => step.id === 'finalize');
      if (finalizeStep) {
        setFinalizationStatus(finalizeStep.status === 'completed' ? 'completed' : 'pending');
      } else if (selectedSourceChain !== selectedTargetChain) {
        setFinalizationStatus('pending'); // Cross-chain sans finalisation = en cours
      } else {
        setFinalizationStatus('completed'); // Same-chain = complété
      }
      
      setShowSuccessModal(true);
      onPaymentSuccess?.(txHash);
    } catch (error: any) {
      console.error('Erreur dans handlePayment:', error);
      
      // 🎯 Vérifier si le transfert CCTP a réussi malgré l'erreur de finalisation
      const transferStep = paymentStatus.steps.find(step => step.id === 'cctp-transfer' && step.status === 'completed');
      
      if (transferStep?.txHash && error.message?.includes('chain')) {
        // Le transfert CCTP a réussi, ouvrir quand même le modal avec un avertissement
        console.log('🎯 Transfert CCTP réussi malgré erreur de finalisation');
        setSuccessTxHash(transferStep.txHash);
        setFinalizationStatus('error'); // Marquer la finalisation comme ayant une erreur
        setShowSuccessModal(true);
        onPaymentSuccess?.(transferStep.txHash);
      } else {
        onPaymentError?.(error.message);
      }
    }
  };



  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-4">
          {listingImage && (
            <img
              src={listingImage}
              alt={listingTitle}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div>
            <h2 className="text-xl font-bold">Paiement Cross-Chain Sécurisé</h2>
            <p className="text-blue-100">Powered by CCTP V2 + ERC-7730</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Détails de l'achat */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Détails de l'achat</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Article:</span>
              <span className="font-medium">{listingTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prix:</span>
              <span className="font-bold text-green-600">{listingPrice} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vendeur:</span>
              <span className="font-mono text-xs">
                {sellerName || `${sellerAddress.slice(0, 6)}...${sellerAddress.slice(-4)}`}
              </span>
            </div>
          </div>
        </div>

        {!isConnected ? (
          /* Connexion wallet */
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👛</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connectez votre wallet
              </h3>
              <p className="text-gray-600 mb-6">
                Connectez votre wallet pour effectuer un paiement sécurisé
              </p>
            </div>
            <ConnectButton />
          </div>
        ) : paymentStatus.isLoading ? (
          /* Progression du paiement */
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Traitement du paiement...
            </h3>
            
            <div className="space-y-3">
              {paymentStatus.steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'completed' 
                      ? 'bg-green-100 text-green-600' 
                      : step.status === 'loading'
                      ? 'bg-blue-100 text-blue-600'
                      : step.status === 'error'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.status === 'completed' ? (
                      <span className="text-sm">✓</span>
                    ) : step.status === 'loading' ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : step.status === 'error' ? (
                      <span className="text-sm">✗</span>
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{step.title}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                    {step.txHash && (
                      <a
                        href={`https://etherscan.io/tx/${step.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Voir la transaction ↗
                      </a>
                    )}
                    {step.errorMessage && (
                      <div className="text-sm text-red-600 mt-1">{step.errorMessage}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {paymentStatus.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Erreur de paiement</p>
                <p className="text-red-600 text-sm">{paymentStatus.error}</p>
                <button
                  onClick={resetPayment}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        ) : paymentStatus.isCompleted ? (
          /* Succès */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Paiement réussi !
            </h3>
            <p className="text-gray-600 mb-4">
              Votre paiement de {listingPrice} USDC a été effectué avec succès
            </p>
            {paymentStatus.txHash && (
              <a
                href={`https://etherscan.io/tx/${paymentStatus.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Voir la transaction ↗
              </a>
            )}
          </div>
        ) : (
          /* Configuration du paiement */
          <div className="space-y-6">
            {/* Sélection de la chaîne source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payer depuis
              </label>
              <div className="grid grid-cols-2 gap-3">
                {chainOptions.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedSourceChain(chain.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedSourceChain === chain.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{chain.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{chain.name}</div>
                        <div className="text-sm text-gray-600">
                          {parseFloat(chain.balance).toFixed(2)} USDC
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sélection de la chaîne de destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Envoyer vers
              </label>
              <div className="grid grid-cols-2 gap-3">
                {chainOptions.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedTargetChain(chain.id)}
                    disabled={chain.id === selectedSourceChain}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTargetChain === chain.id
                        ? 'border-green-500 bg-green-50'
                        : chain.id === selectedSourceChain
                        ? 'border-gray-100 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{chain.icon}</span>
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${
                          chain.id === selectedSourceChain ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          {chain.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {chain.id === selectedSourceChain ? 'Source' : 'Destination'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Résumé des frais */}
            {estimatedFees && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Frais estimés</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais réseau:</span>
                    <span>{estimatedFees.networkFee} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais CCTP:</span>
                    <span>{estimatedFees.bridgeFee} USDC</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t border-yellow-300">
                    <span>Total estimé:</span>
                    <span>~{estimatedFees.total} USD</span>
                  </div>
                </div>
              </div>
            )}

            {/* Prévisualisation ERC-7730 */}
            {transactionPreview && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <button
                  onClick={() => setShowTransactionDetails(!showTransactionDetails)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h4 className="font-medium text-gray-900">
                    🔍 Signature Transparente (ERC-7730)
                  </h4>
                  <span className="text-blue-600">
                    {showTransactionDetails ? '▼' : '▶'}
                  </span>
                </button>
                
                {showTransactionDetails && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="font-medium text-blue-900">{transactionPreview.title}</div>
                      <div className="text-sm text-blue-700">{transactionPreview.description}</div>
                    </div>
                    
                    <div className="space-y-2">
                      {transactionPreview.details && transactionPreview.details.length > 0 ? (
                        transactionPreview.details.map((detail: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-blue-600">{detail.label}:</span>
                            <span className={`font-mono ${
                              detail.type === 'amount' ? 'text-green-700 font-bold' :
                              detail.type === 'address' ? 'text-gray-600' : 'text-blue-900'
                            }`}>
                              {detail.type === 'address' && detail.value.length > 20
                                ? `${detail.value.slice(0, 6)}...${detail.value.slice(-4)}`
                                : detail.value
                              }
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-600">
                          Détails de transaction en cours de génération...
                        </div>
                      )}
                    </div>

                    {transactionPreview.risks && transactionPreview.risks.length > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="font-medium text-yellow-800 text-sm mb-1">
                          ⚠️ Points d'attention
                        </div>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          {transactionPreview.risks.map((risk: any, index: number) => (
                            <li key={index}>• {typeof risk === 'string' ? risk : risk.message}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Vérification du solde */}
            {usdcBalances[selectedSourceChain] && parseFloat(usdcBalances[selectedSourceChain]) < parseFloat(listingPrice) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Solde insuffisant</p>
                <p className="text-red-600 text-sm">
                  Vous avez {parseFloat(usdcBalances[selectedSourceChain]).toFixed(2)} USDC, 
                  mais {listingPrice} USDC sont nécessaires.
                </p>
              </div>
            )}

            {/* Bouton de paiement */}
            <button
              onClick={handlePayment}
              disabled={
                !isConnected ||
                !usdcBalances[selectedSourceChain] ||
                parseFloat(usdcBalances[selectedSourceChain]) < parseFloat(listingPrice)
              }
              className={`w-full py-4 px-6 rounded-lg font-medium transition-all ${
                !isConnected ||
                !usdcBalances[selectedSourceChain] ||
                parseFloat(usdcBalances[selectedSourceChain]) < parseFloat(listingPrice)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {!isConnected 
                ? 'Connectez votre wallet'
                : !usdcBalances[selectedSourceChain] || parseFloat(usdcBalances[selectedSourceChain]) < parseFloat(listingPrice)
                ? 'Solde insuffisant'
                : `Payer ${listingPrice} USDC`
              }
            </button>
          </div>
        )}
      </div>

      {/* 🎊 Modal de succès */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessTxHash('');
          setFinalizationStatus('completed'); // Reset
        }}
        txHash={successTxHash}
        amount={listingPrice}
        sourceChain={selectedSourceChain}
        targetChain={selectedTargetChain}
        listingTitle={listingTitle}
        finalizationStatus={finalizationStatus}
        onRefreshBalances={loadUSDCBalances}
      />
    </div>
  );
} 