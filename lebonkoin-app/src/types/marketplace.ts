import type { Listing as PrismaListing, User, Category as PrismaCategory, Currency, Condition, ListingStatus } from '@prisma/client'

// Type de listing avec les relations incluses (pour les requêtes avec include)
export interface Listing extends Omit<PrismaListing, 'price'> {
  price: number; // Convertir Decimal en number pour l'affichage
  seller: {
    id: string;
    name: string | null;
    avatar: string | null;
    reputation: number;
    isVerified: boolean;
    walletAddress: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string;
    slug: string;
  };
  location: {
    city: string;
    region: string;
    country: string;
  };
  // Nombre de favoris calculé
  _count?: {
    favorites: number;
  };
}

// Type de catégorie avec compteur d'annonces
export interface Category extends PrismaCategory {
  _count?: {
    listings: number;
  };
}

// Types des énums exportés pour faciliter l'utilisation
export { Currency, Condition, ListingStatus }

// Mapping des conditions pour l'affichage
export const CONDITION_LABELS: Record<Condition, string> = {
  NEW: 'Neuf',
  LIKE_NEW: 'Comme neuf',
  GOOD: 'Bon état',
  FAIR: 'État correct',
  POOR: 'Mauvais état'
};

// Mapping des status pour l'affichage
export const STATUS_LABELS: Record<ListingStatus, string> = {
  ACTIVE: 'Actif',
  SOLD: 'Vendu',
  RESERVED: 'Réservé',
  HIDDEN: 'Masqué'
};

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  condition?: Condition[];
  sortBy?: 'recent' | 'price-asc' | 'price-desc' | 'popular';
} 