import { PrismaClient, Currency, Condition, ListingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer des catégories
  const categories = await Promise.all([
    prisma.category.create({
    data: {
      name: 'Électronique',
      icon: '📱',
      slug: 'electronique'
    }
    }),
    prisma.category.create({
      data: {
        name: 'Vêtements',
        icon: '👕',
        slug: 'vetements'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Test CCTP',
        icon: '🧪',
        slug: 'test-cctp'
      }
    })
  ]);

  // Créer des utilisateurs
  const users = await Promise.all([
    prisma.user.create({
      data: {
        address: '0x0813c67B88F1DC95a6e684Cf3BAf4b9A423A9Eb7', // Votre wallet (vendeur des produits test)
        name: 'Florian Test',
        avatar: 'https://picsum.photos/100/100?random=1',
        isVerified: true,
        reputation: 100
      }
    }),
    prisma.user.create({
      data: {
        address: '0x742d35cC533D708c4c10b5F78EfC6d1D52bA0a6A', // Autre wallet pour diversité
        name: 'Alice Durand',
        avatar: 'https://picsum.photos/100/100?random=2',
        isVerified: true,
        reputation: 88
      }
    })
  ]);

  // Créer des annonces TEST pas chères
  const testListings = await Promise.all([
    prisma.listing.create({
      data: {
        title: '🧪 Token Test - 0.10 USDC',
        description: 'Token de test pour démonstration CCTP V2. Prix minimal pour tester les transferts cross-chain. Parfait pour valider le système de paiement sans risque financier.',
        price: 0.10,
        currency: Currency.USDC,
        condition: Condition.NEW,
        images: ['https://picsum.photos/400/300?random=101'],
        status: ListingStatus.ACTIVE,
        city: 'Paris',
        region: 'Île-de-France',
        categoryId: categories[2].id, // Test CCTP
        sellerId: users[0].id,
        views: 0
      }
    }),
    prisma.listing.create({
      data: {
        title: '🚀 Demo CCTP - 0.25 USDC',
        description: 'Produit démo pour hackathon. Test les transferts CCTP entre Ethereum, Base, Arbitrum, Avalanche et Linea. Signature transparente ERC-7730 incluse.',
        price: 0.25,
        currency: Currency.USDC,
        condition: Condition.LIKE_NEW,
        images: ['https://picsum.photos/400/300?random=102'],
        status: ListingStatus.ACTIVE,
        city: 'Lyon',
        region: 'Auvergne-Rhône-Alpes',
        categoryId: categories[2].id,
        sellerId: users[0].id,
        views: 0
      }
    }),
    prisma.listing.create({
      data: {
        title: '⚡ Fast Transfer - 0.50 USDC',
        description: 'Test avancé des transferts CCTP rapides. Idéal pour démontrer les capacités cross-chain en moins de 5 minutes. World ID requis pour maximum de sécurité.',
        price: 0.50,
        currency: Currency.USDC,
        condition: Condition.GOOD,
        images: ['https://picsum.photos/400/300?random=103'],
        status: ListingStatus.ACTIVE,
        city: 'Marseille',
        region: 'Provence-Alpes-Côte d\'Azur',
        categoryId: categories[2].id,
        sellerId: users[0].id,
        views: 0
      }
    }),
    prisma.listing.create({
      data: {
        title: '💎 Premium Test - 1.00 USDC',
        description: 'Test premium pour valider les gros transferts. Parfait pour démonstration complète du système. Inclut toutes les fonctionnalités : CCTP V2, ERC-7730, World ID.',
        price: 1.00,
        currency: Currency.USDC,
        condition: Condition.NEW,
        images: ['https://picsum.photos/400/300?random=104'],
        status: ListingStatus.ACTIVE,
        city: 'Nice',
        region: 'Provence-Alpes-Côte d\'Azur',
        categoryId: categories[2].id,
        sellerId: users[0].id,
        views: 0
      }
    }),
    // Quelques produits normaux aussi
    prisma.listing.create({
      data: {
        title: 'iPhone 13 Pro',
        description: 'iPhone 13 Pro 256GB, état excellent, avec accessoires',
        price: 850.00,
        currency: Currency.USDC,
        condition: Condition.LIKE_NEW,
        images: ['https://picsum.photos/400/300?random=201'],
        status: ListingStatus.ACTIVE,
        city: 'Paris',
        region: 'Île-de-France',
        categoryId: categories[0].id,
        sellerId: users[1].id,
        views: 45
      }
    }),
    prisma.listing.create({
      data: {
        title: 'Veste en cuir vintage',
        description: 'Belle veste en cuir véritable, style vintage années 80',
        price: 75.00,
        currency: Currency.USDC,
        condition: Condition.GOOD,
        images: ['https://picsum.photos/400/300?random=301'],
        status: ListingStatus.ACTIVE,
        city: 'Bordeaux',
        region: 'Nouvelle-Aquitaine',
        categoryId: categories[1].id,
        sellerId: users[1].id,
        views: 23
      }
    })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${testListings.length} listings`);
  console.log('');
  console.log('🧪 Produits test créés:');
  console.log('   - 🧪 Token Test: 0.10 USDC');
  console.log('   - 🚀 Demo CCTP: 0.25 USDC');
  console.log('   - ⚡ Fast Transfer: 0.50 USDC');
  console.log('   - 💎 Premium Test: 1.00 USDC');
  console.log('');
  console.log('💰 Wallet vendeur: 0x0813c67B88F1DC95a6e684Cf3BAf4b9A423A9Eb7');
  console.log('🎯 Les USDC testnet iront dans VOTRE wallet après paiement!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 