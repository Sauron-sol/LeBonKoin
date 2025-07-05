"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSelf } from "@/lib/self";
import { isCCTPSupported, isFastTransferSupported } from "@/lib/wagmi";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

// Import dynamique pour éviter les erreurs SSR
const SelfQRCode = dynamic(() => import("@/components/SelfQRCode"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8">
    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
    <span className="ml-3 text-purple-600">Chargement...</span>
  </div>
});

type Step = 'wallet' | 'self' | 'marketplace';

// Modal de connexion
function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-white flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl border relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Fermer la modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}

function HomePageContent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { isVerified, triggerSelfVerification, isLoading, error, selfProof, showQRCode } = useSelf();
  const [cctpSupported, setCctpSupported] = useState(false);
  const [fastTransferSupported, setFastTransferSupported] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  // Fonction pour ouvrir la modal depuis la navbar
  useEffect(() => {
    (window as any).openAuthModal = () => {
      setIsAuthModalOpen(true);
    };
    
    return () => {
      delete (window as any).openAuthModal;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header avec Navbar */}
      <Navbar />

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
                    {isLoading ? 'Chargement...' : 'Vérifier avec Self ID'}
                  </div>
                </button>
              ) : (
                <div className="space-y-6">
                  <SelfQRCode 
                    onSuccess={(data) => {
                      console.log('✅ Vérification Self réussie:', data);
                    }}
                    onError={(error) => {
                      console.error('❌ Erreur Self:', error);
                    }}
                  />
                </div>
              )}

              {isVerified && selfProof && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center text-green-700 mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Identité vérifiée avec succès !
                  </div>
                  <div className="text-sm text-green-600">
                    <p>✅ Âge vérifié (≥18 ans)</p>
                    <p>✅ Nationalité: {selfProof.nationality}</p>
                    <p>✅ Sanctions OFAC: {selfProof.isOfacValid ? 'Vérifié' : 'Non vérifié'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'marketplace' && (
            <div className="text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Prêt à commencer !
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Votre wallet est connecté et votre identité est vérifiée. 
                Vous pouvez maintenant accéder à la marketplace sécurisée.
              </p>
              <div className="space-y-4">
                <Link
                  href="/marketplace"
                  className="inline-block bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  🛒 Accéder à la Marketplace
                </Link>
                <div className="text-center">
                  <Link
                    href="/create-listing"
                    className="inline-block text-blue-600 hover:text-blue-700 underline text-sm"
                  >
                    Ou créer une nouvelle annonce
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Identité Vérifiée</h3>
            <p className="text-gray-600 text-sm">
              Vérification Self ID pour garantir l'âge, la nationalité et le statut sanctions OFAC.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Paiements Instantanés</h3>
            <p className="text-gray-600 text-sm">
              {cctpSupported ? 'CCTP V2 supporté' : 'CCTP V2 non supporté'} sur cette chaîne.
              {fastTransferSupported && ' Transferts rapides disponibles.'}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Signature Transparente</h3>
            <p className="text-gray-600 text-sm">
              ERC-7730 pour une transparence totale des transactions et métadonnées claires.
            </p>
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <h4 className="text-lg font-semibold text-blue-900 mb-2">
            Réseau actuel: {chainId ? `Chain ID ${chainId}` : 'Non connecté'}
          </h4>
          <div className="flex justify-center space-x-4 text-sm">
            <span className={`px-3 py-1 rounded-full ${cctpSupported ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              CCTP V2: {cctpSupported ? '✅' : '❌'}
            </span>
            <span className={`px-3 py-1 rounded-full ${fastTransferSupported ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              Transferts rapides: {fastTransferSupported ? '✅' : '❌'}
            </span>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default function HomePage() {
  return <HomePageContent />;
} 