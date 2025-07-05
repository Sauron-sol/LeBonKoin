"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSelf } from "@/lib/self";
import { isCCTPSupported, isFastTransferSupported } from "@/lib/wagmi";
import Link from "next/link";
import dynamic from "next/dynamic";

// Import dynamique pour éviter les erreurs SSR
const SelfQRCode = dynamic(() => import("@/components/SelfQRCode"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8">
    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
    <span className="ml-3 text-purple-600">Chargement...</span>
  </div>
});

type Step = 'wallet' | 'self' | 'marketplace';

function HomePageContent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { isVerified, triggerSelfVerification, isLoading, error, selfProof, showQRCode } = useSelf();
  const [cctpSupported, setCctpSupported] = useState(false);
  const [fastTransferSupported, setFastTransferSupported] = useState(false);

  const [currentStep, setCurrentStep] = useState<Step>('wallet');

  useEffect(() => {
    setCctpSupported(isCCTPSupported(chainId));
    setFastTransferSupported(isFastTransferSupported(chainId));
  }, [chainId]);

  // Gestion automatique des étapes
  useEffect(() => {
    if (!isConnected) {
      setCurrentStep('wallet');
    } else if (!isVerified) {
      setCurrentStep('self');
    } else {
      setCurrentStep('marketplace');
    }
  }, [isConnected, isVerified]);

  const getStepStatus = (step: Step) => {
    if (step === 'wallet') return isConnected ? 'completed' : currentStep === 'wallet' ? 'current' : 'pending';
    if (step === 'self') return isVerified ? 'completed' : currentStep === 'self' ? 'current' : 'pending';
    if (step === 'marketplace') return currentStep === 'marketplace' ? 'current' : 'pending';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">🏪 LeBonKoin</h1>
              <span className="ml-3 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-full font-medium">
                Décentralisé
              </span>
            </div>
            {isConnected && (
              <div className="flex items-center space-x-4">
                <ConnectButton />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Marketplace Sécurisée
            <span className="block text-4xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              par Self ID
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Achetez et vendez en toute confiance avec la vérification d'identité anonyme, 
            les paiements cross-chain instantanés et la signature transparente.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            {[
              { id: 'wallet', label: 'Wallet', icon: '👛' },
              { id: 'self', label: 'Self ID', icon: '🔐' },
              { id: 'marketplace', label: 'Marketplace', icon: '🛒' }
            ].map((step, index) => {
              const status = getStepStatus(step.id as Step);
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300
                      ${status === 'completed' ? 'bg-green-500 text-white shadow-lg' : 
                        status === 'current' ? 'bg-blue-500 text-white shadow-lg animate-pulse' : 
                        'bg-gray-200 text-gray-500'}
                    `}>
                      {status === 'completed' ? '✓' : step.icon}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      status === 'completed' ? 'text-green-600' :
                      status === 'current' ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                      getStepStatus(['wallet', 'self', 'marketplace'][index + 1] as Step) !== 'pending' ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {currentStep === 'wallet' && (
            <div className="text-center">
              <div className="text-6xl mb-6">👛</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Connectez votre Wallet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Pour commencer, connectez votre wallet Web3 pour accéder à la marketplace décentralisée.
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
              {isConnected && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Wallet connecté avec succès !
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'self' && (
            <div className="text-center">
              <div className="text-6xl mb-6">🔐</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Vérification Self ID
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Vérifiez votre identité, âge, pays et statut sanctions OFAC de manière sécurisée et privée.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">Erreur de vérification</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              )}

              {!showQRCode ? (
                <button
                  onClick={triggerSelfVerification}
                  disabled={isLoading}
                  className="w-full max-w-sm mx-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                    <div className="flex items-center">
                    <span className="text-2xl mr-3">🔐</span>
                    Vérifier avec Self ID
                  </div>
                </button>
              ) : (
                <SelfQRCode
                  onSuccess={(data) => {
                    console.log('Vérification Self réussie:', data);
                  }}
                  onError={(error) => {
                    console.error('Erreur Self:', error);
                  }}
                />
              )}

              {/* Affichage des détails de vérification si disponible */}
              {selfProof && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-left max-w-lg mx-auto">
                  <h4 className="font-semibold text-green-900 mb-3 text-center">
                    ✅ Détails de votre vérification Self ID
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Nationalité:</span>
                      <span className="text-green-900 font-medium">{selfProof.nationality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Âge minimum:</span>
                      <span className="text-green-900 font-medium">{selfProof.olderThan}+ ans</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Sanctions OFAC:</span>
                      <span className={`font-medium ${selfProof.isOfacValid ? 'text-green-900' : 'text-red-900'}`}>
                        {selfProof.isOfacValid ? 'Aucune' : 'BLOQUÉ'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Nom:</span>
                      <span className="text-green-900 font-medium">{selfProof.name.join(' ')}</span>
                  </div>
                  </div>
                </div>
              )}

              <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6 text-left max-w-lg mx-auto">
                <h4 className="font-semibold text-purple-900 mb-3 text-center">
                  🔐 Comment fonctionne Self ID ?
                </h4>
                <ol className="text-sm text-purple-800 space-y-2">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                    Cliquez sur "🔐 Vérifier avec Self ID" ci-dessus
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                    Scannez le QR code avec l'app Self sur votre téléphone
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                    Scannez votre document d'identité (passeport/carte ID UE)
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                    Preuve ZK générée et vérifiée sur notre serveur
                  </li>
                </ol>
                <p className="text-sm text-purple-700 mt-3 font-medium text-center">
                  🔒 <strong>Sécurisé :</strong> Vos données personnelles ne quittent jamais votre appareil !
                </p>
                <p className="text-xs text-purple-600 mt-2 text-center">
                  <strong>Vraie vérification Self SDK</strong> - Téléchargez l'app Self pour continuer
                </p>
              </div>
            </div>
          )}

          {currentStep === 'marketplace' && (
            <div className="text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Bienvenue sur LeBonKoin !
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Vous pouvez maintenant accéder à toutes les fonctionnalités de la marketplace décentralisée.
              </p>

              {/* Status cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">👛</div>
                  <div className="text-sm font-medium text-green-800">Wallet Connecté</div>
                  <div className="text-xs text-green-600">{address?.slice(0, 10)}...</div>
                </div>
                <div className="bg-green-50 border-green-200 border rounded-lg p-4">
                  <div className="text-2xl mb-2">🔐</div>
                  <div className="text-sm font-medium text-green-800">
                    Self ID Vérifié
                  </div>
                  <div className="text-xs text-green-600">
                    Identité vérifiée
                  </div>
                </div>
                <div className={`border rounded-lg p-4 ${
                  cctpSupported ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-2xl mb-2">⚡</div>
                  <div className={`text-sm font-medium ${
                    cctpSupported ? 'text-green-800' : 'text-gray-600'
                  }`}>
                    CCTP V2
                  </div>
                  <div className={`text-xs ${
                    cctpSupported ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {cctpSupported ? 'Paiements rapides' : 'Non supporté'}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/marketplace"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <span className="text-xl mr-2">🛒</span>
                  Explorer la Marketplace
                </Link>
                <Link
                  href="/create-listing"
                  className="bg-green-600 text-white py-4 px-8 rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <span className="text-xl mr-2">📝</span>
                  Créer une Annonce
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center bg-white rounded-xl p-6 shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sécurisé</h3>
            <p className="text-gray-600">
              Vérification d'identité Self ID avec contrôle âge, pays et sanctions OFAC
            </p>
          </div>
          
          <div className="text-center bg-white rounded-xl p-6 shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instantané</h3>
            <p className="text-gray-600">
              Paiements cross-chain avec CCTP V2 en 8-20 secondes
            </p>
          </div>
          
          <div className="text-center bg-white rounded-xl p-6 shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👁️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent</h3>
            <p className="text-gray-600">
              Signature claire avec ERC-7730 - vous savez toujours ce que vous signez
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return <HomePageContent />;
} 