"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWorldID } from "@/lib/worldid";
import { isCCTPSupported, isFastTransferSupported } from "@/lib/wagmi";
import Link from "next/link";

type Step = 'wallet' | 'worldid' | 'marketplace';

function HomePageContent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { isVerified, triggerWorldIDWidget, isLoading, error } = useWorldID();
  const [cctpSupported, setCctpSupported] = useState(false);
  const [fastTransferSupported, setFastTransferSupported] = useState(false);
  const [skipWorldID, setSkipWorldID] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('wallet');

  useEffect(() => {
    setCctpSupported(isCCTPSupported(chainId));
    setFastTransferSupported(isFastTransferSupported(chainId));
  }, [chainId]);

  // Gestion automatique des étapes
  useEffect(() => {
    if (!isConnected) {
      setCurrentStep('wallet');
    } else if (!isVerified && !skipWorldID) {
      setCurrentStep('worldid');
    } else {
      setCurrentStep('marketplace');
    }
  }, [isConnected, isVerified, skipWorldID]);

  const handleSkipWorldID = () => {
    setSkipWorldID(true);
    setCurrentStep('marketplace');
  };

  const getStepStatus = (step: Step) => {
    if (step === 'wallet') return isConnected ? 'completed' : currentStep === 'wallet' ? 'current' : 'pending';
    if (step === 'worldid') return (isVerified || skipWorldID) ? 'completed' : currentStep === 'worldid' ? 'current' : 'pending';
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
            <span className="block text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              par World ID
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
              { id: 'worldid', label: 'World ID', icon: '🌍' },
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
                      getStepStatus(['wallet', 'worldid', 'marketplace'][index + 1] as Step) !== 'pending' ? 'bg-green-500' : 'bg-gray-200'
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

          {currentStep === 'worldid' && (
            <div className="text-center">
              <div className="text-6xl mb-6">🌍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Vérification World ID
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Vérifiez votre identité de manière anonyme pour accéder aux fonctionnalités premium et sécurisées.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">Erreur de vérification</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={triggerWorldIDWidget}
                  disabled={isLoading}
                  className="w-full max-w-sm mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                      Vérification en cours...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🌍</span>
                      Vérifier avec World ID
                    </div>
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <button
                  onClick={handleSkipWorldID}
                  className="w-full max-w-sm mx-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  ⚠️ Ignorer pour le moment (Demo)
                </button>
              </div>

              {/* Instructions World ID */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-lg mx-auto">
                <h4 className="font-semibold text-blue-900 mb-3 text-center">
                  📱 Comment utiliser World ID ?
                </h4>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                    Téléchargez l'app <strong>World App</strong> sur votre téléphone
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                    Cliquez sur "🌍 Vérifier avec World ID" ci-dessus
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                    Scannez le QR code avec l'app World App
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                    Suivez les instructions pour la vérification Device
                  </li>
                </ol>
                <p className="text-sm text-blue-700 mt-3 font-medium text-center">
                  💡 <strong>Note :</strong> Pas besoin d'être vérifié par un Orb !
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
                <div className={`border rounded-lg p-4 ${
                  isVerified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="text-2xl mb-2">🌍</div>
                  <div className={`text-sm font-medium ${
                    isVerified ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {isVerified ? 'World ID Vérifié' : 'Mode Demo'}
                  </div>
                  <div className={`text-xs ${
                    isVerified ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {isVerified ? 'Identité vérifiée' : 'Vérification ignorée'}
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
              Vérification d'identité World ID pour des transactions en toute confiance
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