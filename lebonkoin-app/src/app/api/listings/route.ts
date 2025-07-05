import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Condition, ListingStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Récupération des paramètres de recherche
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Construction des filtres Prisma
    const where: any = {
      status: 'ACTIVE' as ListingStatus, // Seulement les annonces actives
    };

    // Filtre par recherche textuelle
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Filtre par catégorie
    if (category) {
      where.category = {
        slug: category
      };
    }

    // Filtre par prix
    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }

    // Filtre par condition
    if (condition) {
      const conditions = condition.split(',') as Condition[];
      where.condition = {
        in: conditions
      };
    }

    // Configuration du tri
    let orderBy: any = { createdAt: 'desc' }; // Par défaut : plus récent
    
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { views: 'desc' };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit;

    // Requête Prisma avec relations incluses
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              reputation: true,
              isVerified: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              slug: true
            }
          },
          _count: {
            select: {
              favorites: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.listing.count({ where })
    ]);

    // Transformation des données pour le frontend
    const transformedListings = listings.map(listing => ({
      ...listing,
      price: Number(listing.price), // Conversion Decimal vers number
      location: {
        city: listing.city,
        region: listing.region,
        country: listing.country
      }
    }));

    return NextResponse.json({
      success: true,
      data: transformedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la récupération des annonces',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 