"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing, Category, SearchFilters, CONDITION_LABELS, Condition } from "@/types/marketplace";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navbar from "@/components/Navbar";

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
          {/* <h2 className="text-2xl font-bold text-gray-900">Connexion</h2> */}
        </div>
        
        <div className="space-y-4">
          {/* <p className="text-gray-600 text-center mb-6">
            Vous devez connecter votre wallet pour voir les détails des produits
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
          </div> */}
          
          {/* <div className="mt-6 pt-4 border-t"> */}
            {/* <p className="text-sm text-gray-500 text-center">
              Ou utilisez RainbowKit pour plus d'options
            </p> */}
            <div className="flex justify-center mt-3">
              <ConnectButton />
            </div>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'recent'
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isConnected } = useAccount();

  // Fonction pour récupérer les annonces
  const fetchListings = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      
      if (filters.query) searchParams.set('query', filters.query);
      if (filters.category) searchParams.set('category', filters.category);
      if (filters.minPrice) searchParams.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) searchParams.set('maxPrice', filters.maxPrice.toString());
      if (filters.condition && filters.condition.length > 0) {
        searchParams.set('condition', filters.condition.join(','));
      }
      if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);
      
      const response = await fetch(`/api/listings?${searchParams.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setListings(result.data);
        setError(null);
      } else {
        setError(result.message || 'Erreur lors du chargement des annonces');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur lors du chargement des annonces:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les catégories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('Erreur lors du chargement des catégories:', result.message);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchCategories();
  }, []);

  // Recharger les annonces quand les filtres changent
  useEffect(() => {
    fetchListings();
  }, [filters]);

  // Fonction pour ouvrir la modal depuis la navbar
  useEffect(() => {
    (window as any).openAuthModal = () => {
      setIsAuthModalOpen(true);
    };
    
    return () => {
      delete (window as any).openAuthModal;
    };
  }, []);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'EUR' ? 'EUR' : 'USD',
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(date));
  };

  const getConditionLabel = (condition: Condition) => {
    return CONDITION_LABELS[condition] || condition;
  };

  const handleConnectClick = () => {
    if (!isConnected) {
      setIsAuthModalOpen(true);
    }
  };

  const handleProductClick = (listingId: string) => {
    if (!isConnected) {
      setIsAuthModalOpen(true);
    } else {
      // Ici on peut rediriger vers la page du produit ou ouvrir une modal produit
      console.log(`Produit ${listingId} cliqué - utilisateur connecté`);
      // Exemple: router.push(`/product/${listingId}`);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchListings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar commune */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb et titre */}
        <div className="flex items-center mb-6">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="ml-4 text-2xl font-semibold text-gray-900">
            Search results for "{filters.query || 'all items'}"
          </h1>
          <span className="ml-auto text-sm text-gray-500">
            {loading ? 'Chargement...' : `${listings.length} results`}
          </span>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filtres */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">All categories</h3>
              
              {/* Condition */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Condition</h4>
                <div className="space-y-2">
                  {(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as Condition[]).map(condition => (
                    <label key={condition} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={filters.condition?.includes(condition) || false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              condition: [...(prev.condition || []), condition]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              condition: prev.condition?.filter(c => c !== condition)
                            }));
                          }
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {getConditionLabel(condition)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Item type */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Item type</h4>
                <div className="space-y-2">
                  {['Used', 'Like new', 'Damaged'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                <select
                  title="Sélectionner une catégorie"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.slug}>
                      {category.icon} {category.name} ({category._count?.listings || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                <div className="space-y-2">
                  {['Paris', 'Lyon', 'Marseille', 'Toulouse'].map((location) => (
                    <label key={location} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prix */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Prix</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
              </div>

              {/* Trier par */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Trier par</h4>
                <select
                  title="Sélectionner un tri"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.sortBy || 'recent'}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                >
                  <option value="recent">Plus récent</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="popular">Plus populaire</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grille des produits */}
          <div className="flex-1">
            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Chargement des annonces...</span>
              </div>
            )}

            {/* Grid des annonces */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => handleProductClick(listing.id)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200">
                      {listing.images && listing.images.length > 0 ? (
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={listings.indexOf(listing) < 4}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          📷 Pas d'image
                        </div>
                      )}
                      {listing.seller.isVerified && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          ✓ Vérifié
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl font-bold text-blue-600">
                          {formatPrice(listing.price, listing.currency)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getConditionLabel(listing.condition)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{listing.location.city}</span>
                        <span>{formatDate(listing.createdAt)}</span>
                      </div>

                      <div className="flex items-center mt-3">
                        <div className="w-6 h-6 bg-gray-300 rounded-full mr-2">
                          {listing.seller.avatar && (
                            <Image
                              src={listing.seller.avatar}
                              alt={listing.seller.name || 'Vendeur'}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {listing.seller.name || 'Vendeur anonyme'}
                        </span>
                        <span className="ml-auto text-xs text-gray-400">
                          👁️ {listing.views}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && listings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune annonce trouvée
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            )}

            {/* Bouton See more */}
            {!loading && listings.length > 0 && (
              <div className="mt-8 text-center">
                <button className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors">
                  See more
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de connexion */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
} 