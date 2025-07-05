"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Listing, CONDITION_LABELS } from "@/types/marketplace";
import { MultichainPayment } from "@/components/MultichainPayment";
import GaslessPayment from "@/components/GaslessPayment";

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'cctp' | 'gasless'>('cctp');

  // Fonction pour récupérer l'annonce
  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${listingId}`);
      const result = await response.json();
      
      if (result.success) {
        setListing(result.data);
        setError(null);
      } else {
        setError(result.message || 'Annonce introuvable');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur lors du chargement de l\'annonce:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger l'annonce au montage du composant
  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'EUR' ? 'EUR' : 'USD',
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getConditionLabel = (condition: string) => {
    return CONDITION_LABELS[condition as keyof typeof CONDITION_LABELS] || condition;
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      'NEW': 'bg-green-100 text-green-800',
      'LIKE_NEW': 'bg-green-100 text-green-800',
      'GOOD': 'bg-blue-100 text-blue-800',
      'FAIR': 'bg-yellow-100 text-yellow-800',
      'POOR': 'bg-red-100 text-red-800'
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Gestionnaires pour le paiement
  const handlePaymentSuccess = (txHash: string) => {
    setPaymentSuccess(true);
    setShowPaymentModal(false);
    console.log('Paiement réussi:', txHash);
    // Ici on pourrait rediriger vers une page de confirmation
    // ou mettre à jour le statut de l'annonce
  };

  const handlePaymentError = (error: string) => {
    console.error('Erreur de paiement:', error);
    // Ici on pourrait afficher une notification d'erreur
  };

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'annonce...</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Annonce introuvable</h1>
          <p className="text-gray-600 mb-4">{error || 'Cette annonce n\'existe pas ou a été supprimée.'}</p>
          <Link
            href="/marketplace"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900">
              <span className="mr-2">←</span>
              <h1 className="text-lg font-medium">Retour à la marketplace</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Image principale */}
              <div className="relative h-96 bg-gray-200">
                {listing.images && listing.images.length > 0 ? (
                <Image
                  src={listing.images[selectedImageIndex]}
                  alt={listing.title}
                  fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    priority={true}
                  className="object-cover"
                />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="text-6xl mb-2">📷</div>
                      <p>Aucune image disponible</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Galerie d'images */}
              {listing.images && listing.images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {listing.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                          selectedImageIndex === index ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${listing.title} - Image ${index + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          </div>

          {/* Sidebar - Infos et actions */}
          <div className="space-y-6">
            {/* Prix et titre */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {listing.title}
              </h1>
              
              <div className="text-3xl font-bold text-blue-600 mb-4">
                {formatPrice(listing.price, listing.currency)}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(listing.condition)}`}>
                  {getConditionLabel(listing.condition)}
                </span>
                {listing.seller.isVerified && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Vendeur vérifié
                  </span>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  💬 Contacter le vendeur
                </button>
                
                {paymentSuccess ? (
                  <div className="w-full bg-green-100 border border-green-200 text-green-800 py-3 px-4 rounded-lg text-center font-semibold">
                    ✅ Achat effectué avec succès !
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        setPaymentMode('cctp');
                        setShowPaymentModal(true);
                      }}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                  💳 Acheter maintenant (CCTP V2)
                </button>
                    
                    <button 
                      onClick={() => {
                        setPaymentMode('gasless');
                        setShowPaymentModal(true);
                      }}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold relative"
                    >
                      ⚡ Payer sans ETH (Gasless)
                    </button>
                  </div>
                )}
                
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  ❤️ Ajouter aux favoris
                </button>
              </div>
            </div>

            {/* Informations du vendeur */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendeur</h3>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                  {listing.seller.avatar && (
                    <Image
                      src={listing.seller.avatar}
                      alt={listing.seller.name || 'Vendeur'}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {listing.seller.name || 'Vendeur anonyme'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Réputation: {listing.seller.reputation}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Membre depuis</span>
                <span>{new Date(listing.createdAt).getFullYear()}</span>
              </div>
            </div>

            {/* Localisation */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Ville</span>
                  <span>{listing.location.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Région</span>
                  <span>{listing.location.region}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pays</span>
                  <span>{listing.location.country}</span>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>👁️ Vues</span>
                  <span>{listing.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>❤️ Favoris</span>
                  <span>{listing._count?.favorites || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>📅 Publié le</span>
                  <span>{formatDate(listing.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                🔒 Transaction sécurisée
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Vendeur vérifié par World ID</li>
                <li>✓ Paiement sécurisé CCTP V2</li>
                <li>✓ Signature transparente ERC-7730</li>
                <li>✓ Protection contre la fraude</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de paiement CCTP V2 + ERC-7730 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {paymentMode === 'cctp' ? 'Paiement Sécurisé Cross-Chain' : 'Paiement Gasless Circle'}
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPaymentMode('cctp')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      paymentMode === 'cctp' 
                        ? 'bg-white text-green-700 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    💳 CCTP V2
                  </button>
                  <button
                    onClick={() => setPaymentMode('gasless')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      paymentMode === 'gasless' 
                        ? 'bg-white text-purple-700 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ⚡ Gasless
                  </button>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {paymentMode === 'cctp' ? (
                <MultichainPayment
                  listingId={listingId}
                  listingTitle={listing.title}
                  listingPrice={listing.price.toString()}
                  sellerAddress={(listing.seller as any).address as `0x${string}`}
                  sellerName={listing.seller.name || undefined}
                  listingImage={listing.images?.[0]}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              ) : (
                <GaslessPayment
                  recipientAddress={(listing.seller as any).address}
                  amount={listing.price.toString()}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 