import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID de l\'annonce requis'
        },
        { status: 400 }
      );
    }

    // Récupérer l'annonce avec toutes les relations
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            reputation: true,
            isVerified: true,
            address: true, // 🔥 AJOUT: Adresse du vendeur pour les paiements
            createdAt: true
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
      }
    });

    if (!listing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Annonce introuvable'
        },
        { status: 404 }
      );
    }

    // Incrémenter le compteur de vues de manière asynchrone (fire-and-forget)
    prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } }
    }).catch(error => {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
    });

    // Transformation des données pour le frontend
    const transformedListing = {
      ...listing,
      price: Number(listing.price), // Conversion Decimal vers number
      location: {
        city: listing.city,
        region: listing.region,
        country: listing.country
      }
    };

    return NextResponse.json({
      success: true,
      data: transformedListing
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'annonce:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la récupération de l\'annonce',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 