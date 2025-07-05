"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import Navbar from '@/components/Navbar';

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
          <p className="text-gray-600 text-center mb-6">
            Connectez votre wallet pour accéder à toutes les fonctionnalités
          </p>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
              <span className="mr-2">🦊</span>
              Rabbit MetaMask
            </button>
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
              <span className="mr-2">🐰</span>
              Rabbit WalletConnect
            </button>
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
              <span className="mr-2">🏦</span>
              Rabbit Coinbase
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500 text-center">
              Ou utilisez RainbowKit pour plus d'options
            </p>
            <div className="flex justify-center mt-3">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { isConnected } = useAccount();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleVerify = async (proof: any) => {
    console.log('World ID verification:', proof);
    // Ici vous pourriez envoyer la preuve à votre backend
  };

  const onSuccess = () => {
    console.log('World ID verification successful');
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
    <div className="min-h-screen bg-white">
      {/* Navbar commune */}
      <Navbar />

      {/* Section Hero */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Buy and sell second-hand items easily
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Découvrez une marketplace sécurisée où vous pouvez acheter et vendre en toute confiance
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/marketplace"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore marketplace
            </Link>
            <Link
              href="/marketplace"
              className="border  border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Start shopping
            </Link>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600 text-lg">Listings</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5K</div>
              <div className="text-gray-600 text-lg">Sellers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
              <div className="text-gray-600 text-lg">Active buyers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Web3 - Marketplace Sécurisée */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            Marketplace Sécurisée par World ID
          </h2>
          
          {/* Processus en 3 étapes */}
          <div className="flex justify-center items-center space-x-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">👛</span>
              </div>
              <span className="text-gray-700 font-medium">Wallet</span>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">🌍</span>
              </div>
              <span className="text-gray-700 font-medium">World ID</span>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">🛒</span>
              </div>
              <span className="text-gray-700 font-medium">Marketplace</span>
            </div>
          </div>

          {/* Card de connexion */}
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Connectez votre portefeuille
            </h3>
            <div className="flex justify-center items-center">
              <ConnectButton />
            </div>
            
            {isConnected && (
              <div className="space-y-4">
                <IDKitWidget
                  app_id="app_staging_123456789"
                  action="verify_human"
                  onSuccess={onSuccess}
                  handleVerify={handleVerify}
                  verification_level={VerificationLevel.Device}
                >
                  {({ open }) => (
                    <button
                      onClick={open}
                      className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      🌍 Vérifier avec World ID
                    </button>
                  )}
                </IDKitWidget>
              </div>
            )}
          </div>

          {/* Fonctionnalités */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sécurisé</h3>
              <p className="text-gray-600">Transactions protégées par la blockchain</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instantané</h3>
              <p className="text-gray-600">Paiements rapides avec CCTP</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">👁️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent</h3>
              <p className="text-gray-600">Signatures claires avec ERC-7730</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top sellers */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Top sellers this week
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Sarah M.", sales: "142 sales", image: "https://picsum.photos/150/150?random=1" },
              { name: "Mike R.", sales: "98 sales", image: "https://picsum.photos/150/150?random=2" },
              { name: "Emma L.", sales: "87 sales", image: "https://picsum.photos/150/150?random=3" },
              { name: "Alex K.", sales: "76 sales", image: "https://picsum.photos/150/150?random=4" }
            ].map((seller, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm">
                <Image
                  src={seller.image}
                  alt={seller.name}
                  width={80}
                  height={80}
                  className="rounded-full mx-auto mb-4"
                />
                <h3 className="font-semibold text-gray-900 mb-1">{seller.name}</h3>
                <p className="text-gray-600 text-sm">{seller.sales}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay updated
          </h2>
          <p className="text-gray-600 mb-8">
            Get notified about new listings and special offers
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Modal de connexion */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
} 