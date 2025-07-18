"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Category, Currency, Condition, CONDITION_LABELS } from "@/types/marketplace";
import Navbar from "@/components/Navbar";

interface CreateListingForm {
  title: string;
  description: string;
  price: string;
  currency: Currency;
  category: string;
  condition: Condition;
  images: string[];
  location: {
    city: string;
    region: string;
    country: string;
  };
}

export default function CreateListingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [form, setForm] = useState<CreateListingForm>({
    title: '',
    description: '',
    price: '',
    currency: 'EUR',
    category: '',
    condition: 'GOOD',
    images: [],
    location: {
      city: '',
      region: '',
      country: 'France',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Charger les catégories depuis l'API
  useEffect(() => {
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
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'une soumission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setShowSuccess(true);

    // Redirection après 3 secondes
    setTimeout(() => {
      window.location.href = '/marketplace';
    }, 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulation d'upload d'images
      const newImages = Array.from(files).map((file, index) => 
        `https://picsum.photos/500/500?random=${Date.now() + index}`
      );
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5) // Max 5 images
      }));
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Annonce créée !</h1>
          <p className="text-gray-600 mb-4">
            Votre annonce a été publiée avec succès sur la marketplace.
          </p>
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">
            Redirection vers la marketplace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar commune */}
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">
              ← Retour à la marketplace
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Créer une nouvelle annonce</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              📝 Créer une nouvelle annonce
            </h1>
            <p className="text-gray-600 mt-1">
              Remplissez les informations ci-dessous pour publier votre annonce
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'annonce *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: iPhone 15 Pro Max 256GB - Titane Naturel"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez votre objet en détail : état, utilisation, accessoires inclus..."
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix *
                </label>
                <div className="flex">
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1200"
                    value={form.price}
                    onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                  />
                  <select
                    title="Devise"
                    className="px-4 py-3 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    value={form.currency}
                    onChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value as Currency }))}
                  >
                    <option value="EUR">EUR</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  title="Catégorie"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Chargement des catégories...' : 'Sélectionnez une catégorie'}
                  </option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* État */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État *
                </label>
                <select
                  title="État de l'objet"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={form.condition}
                  onChange={(e) => setForm(prev => ({ ...prev, condition: e.target.value as Condition }))}
                >
                  {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paris"
                  value={form.location.city}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))}
                />
              </div>
            </div>

            {/* Région */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Région *
              </label>
                    <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Île-de-France"
                value={form.location.region}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  location: { ...prev.location, region: e.target.value }
                }))}
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (Max 5)
              </label>
              
              {/* Images existantes */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {form.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        title="Supprimer cette image"
                        aria-label="Supprimer cette image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload */}
              {form.images.length < 5 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <div className="text-4xl mb-3">📷</div>
                  <p className="text-gray-600 mb-3 text-lg">Ajoutez des photos de votre objet</p>
                  <p className="text-gray-500 text-sm mb-4">Les photos aident à vendre plus rapidement</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block font-medium"
                  >
                    Sélectionner des images
                  </label>
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/marketplace"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || loadingCategories}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Publication en cours...
                  </>
                ) : (
                  '📝 Publier l\'annonce'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 