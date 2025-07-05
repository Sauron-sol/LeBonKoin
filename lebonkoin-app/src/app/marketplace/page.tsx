"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing, Category, SearchFilters, CONDITION_LABELS, Condition } from "@/types/marketplace";

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'recent'
  });

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🏪 LeBonKoin</h1>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Marketplace
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/create-listing"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📝 Créer une annonce
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtres */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
              
              {/* Recherche */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  placeholder="Rechercher un objet..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.query || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                />
              </div>

              {/* Catégories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
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

              {/* Prix */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix
                </label>
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

              {/* État */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État
                </label>
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

              {/* Trier par */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trier par
                </label>
                <select
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

          {/* Main content - Listings */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Toutes les annonces
              </h1>
              <p className="text-gray-600">
                {loading ? 'Chargement...' : `${listings.length} annonce${listings.length > 1 ? 's' : ''} trouvée${listings.length > 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Chargement des annonces...</span>
              </div>
            )}

            {/* Grid des annonces */}
            {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/marketplace/${listing.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
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
                </Link>
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
          </div>
        </div>
      </div>
    </div>
  );
} 