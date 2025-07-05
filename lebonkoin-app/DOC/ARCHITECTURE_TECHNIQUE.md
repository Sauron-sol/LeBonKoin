# 🏗️ Architecture Technique - LeBonKoin

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Stack Technologique](#stack-technologique)
3. [Architecture des Services](#architecture-des-services)
4. [Flux de Données](#flux-de-données)
5. [Sécurité](#sécurité)
6. [Performance](#performance)
7. [Monitoring](#monitoring)

---

## 🎯 Vue d'ensemble

LeBonKoin utilise une architecture **microservices** avec une approche **API-first** pour garantir :
- **Scalabilité** : Chaque service peut être mis à l'échelle indépendamment
- **Maintenabilité** : Code modulaire et testable
- **Résilience** : Tolérance aux pannes avec fallbacks
- **Interopérabilité** : APIs standardisées

## 🔧 Stack Technologique

### Frontend
```typescript
// Framework & UI
Next.js 15          // Framework React avec SSR/SSG
TypeScript          // Type safety
Tailwind CSS        // Styling utility-first
React 19            // Bibliothèque UI

// Web3 & Blockchain
Wagmi               // Hooks React pour Ethereum
Viem                // Client Ethereum type-safe
RainbowKit          // Interface de connexion wallet
Ethers.js           // Interactions blockchain

// State Management
TanStack Query      // Gestion des requêtes API
Zustand             // State management léger
```

### Backend & Base de Données
```typescript
// Base de données
PostgreSQL 15       // Base de données relationnelle
Prisma              // ORM type-safe
Redis               // Cache et sessions

// APIs & Services
Next.js API Routes  // Endpoints API
tRPC                // Type-safe API (optionnel)
Zod                 // Validation de schémas
```

### Infrastructure
```yaml
# Conteneurisation
Docker              # Containerisation
Docker Compose      # Orchestration locale

# Monitoring
Sentry              # Error tracking
Vercel Analytics    # Performance monitoring
```

---

## 🏛️ Architecture des Services

### 1. Service Frontend (Next.js)

```
src/app/
├── (auth)/                 # Routes authentifiées
├── marketplace/            # Pages marketplace
├── api/                    # API routes
│   ├── users/             # Gestion utilisateurs
│   ├── listings/          # Gestion annonces
│   ├── transactions/      # Gestion transactions
│   └── webhooks/          # Webhooks externes
├── globals.css            # Styles globaux
├── layout.tsx             # Layout principal
├── page.tsx               # Page d'accueil
└── providers.tsx          # Providers React
```

**Responsabilités :**
- Interface utilisateur responsive
- Gestion des états UI
- Interactions wallet
- Routage et navigation

### 2. Service Base de Données (PostgreSQL + Prisma)

```prisma
// Schema principal
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modèles principaux
model User { ... }
model Listing { ... }
model Transaction { ... }
model Category { ... }
model Favorite { ... }
```

**Responsabilités :**
- Persistance des données
- Intégrité référentielle
- Requêtes optimisées
- Migrations de schéma

### 3. Service CCTP (Cross-Chain Transfer Protocol)

```typescript
// src/lib/cctp.ts
export class CCTPService {
  // Initier un transfert cross-chain
  async initiateCCTPTransfer(params: CCTPTransferParams): Promise<CCTPResult>
  
  // Suivre un transfert
  async trackCCTPTransfer(messageHash: string): Promise<CCTPStatus>
  
  // Obtenir une attestation
  async getAttestation(messageHash: string): Promise<string>
  
  // Finaliser un transfert
  async finalizeCCTPTransfer(params: FinalizeParams): Promise<TransactionReceipt>
}
```

**Responsabilités :**
- Transferts USDC cross-chain
- Gestion des attestations Circle
- Suivi des transactions
- Gestion des erreurs de réseau

### 4. Service ERC-7730 (Clear Signing)

```typescript
// src/lib/erc7730.ts
export class ERC7730Service {
  // Générer des métadonnées
  generateMetadata(transaction: Transaction): ERC7730Metadata
  
  // Valider la conformité
  validateMetadata(metadata: ERC7730Metadata): boolean
  
  // Formater pour l'affichage
  formatForDisplay(metadata: ERC7730Metadata): DisplayData
}
```

**Responsabilités :**
- Génération de métadonnées JSON
- Validation de conformité ERC-7730
- Formatage pour l'affichage
- Intégration avec wallets

### 5. Service World ID

```typescript
// src/lib/worldid.tsx
export class WorldIDService {
  // Vérifier l'identité
  async verifyIdentity(proof: WorldIDProof): Promise<VerificationResult>
  
  // Stocker le nullifier
  async storeNullifier(nullifierHash: string, userAddress: string): Promise<void>
  
  // Vérifier l'unicité
  async checkUniqueness(nullifierHash: string): Promise<boolean>
}
```

**Responsabilités :**
- Vérification d'identité
- Prévention des doublons
- Gestion des preuves cryptographiques
- Intégration avec World ID

---

## 🔄 Flux de Données

### 1. Flux d'Authentification

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant W as Wallet
    participant DB as Database
    participant WID as World ID

    U->>F: Connexion
    F->>W: Demande connexion
    W->>F: Adresse wallet
    F->>DB: Vérifier utilisateur
    DB->>F: Données utilisateur
    F->>WID: Vérifier World ID (optionnel)
    WID->>F: Statut vérification
    F->>U: Interface connectée
```

### 2. Flux de Paiement CCTP

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant CCTP as Service CCTP
    participant C as Circle API
    participant BC1 as Blockchain Source
    participant BC2 as Blockchain Destination

    U->>F: Initier paiement
    F->>CCTP: Préparer transfert
    CCTP->>BC1: Burn USDC
    BC1->>CCTP: Message hash
    CCTP->>C: Demander attestation
    C->>CCTP: Attestation
    CCTP->>BC2: Mint USDC
    BC2->>CCTP: Confirmation
    CCTP->>F: Transfert complété
    F->>U: Confirmation
```

### 3. Flux de Signature ERC-7730

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant ERC as Service ERC-7730
    participant W as Wallet

    U->>F: Confirmer transaction
    F->>ERC: Générer métadonnées
    ERC->>F: Métadonnées JSON
    F->>U: Aperçu transaction
    U->>F: Confirmer
    F->>W: Demander signature
    W->>U: Afficher détails clairs
    U->>W: Signer
    W->>F: Signature
    F->>ERC: Exécuter transaction
```

---

## 🔒 Sécurité

### 1. Authentification & Autorisation

```typescript
// Middleware d'authentification
export async function authMiddleware(req: NextRequest) {
  const signature = req.headers.get('x-signature');
  const message = req.headers.get('x-message');
  const address = req.headers.get('x-address');
  
  if (!signature || !message || !address) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const isValid = await verifySignature(signature, message, address);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  return NextResponse.next();
}
```

### 2. Validation des Données

```typescript
// Schémas Zod pour validation
export const CreateListingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  price: z.number().positive(),
  currency: z.enum(['EUR', 'USDC']),
  categoryId: z.string().cuid(),
  images: z.array(z.string().url()).max(5),
});
```

### 3. Protection CSRF

```typescript
// Token CSRF pour les API routes
export async function generateCSRFToken(userAddress: string): Promise<string> {
  const token = await sign({ address: userAddress }, process.env.CSRF_SECRET!);
  return token;
}
```

### 4. Rate Limiting

```typescript
// Limitation des requêtes
export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true,
});
```

---

## ⚡ Performance

### 1. Optimisations Frontend

```typescript
// Lazy loading des composants
const MarketplaceComponent = dynamic(() => import('./Marketplace'), {
  loading: () => <MarketplaceSkeleton />,
  ssr: false,
});

// Mise en cache des requêtes
export const useListings = () => {
  return useQuery({
    queryKey: ['listings'],
    queryFn: fetchListings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### 2. Optimisations Base de Données

```prisma
// Index pour les requêtes fréquentes
model Listing {
  // ...
  @@index([status, createdAt])
  @@index([categoryId, price])
  @@index([sellerId])
}
```

### 3. Mise en Cache

```typescript
// Cache Redis pour les données fréquentes
export async function getCachedListings(): Promise<Listing[]> {
  const cached = await redis.get('listings:active');
  if (cached) {
    return JSON.parse(cached);
  }
  
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    include: { category: true, seller: true },
  });
  
  await redis.setex('listings:active', 300, JSON.stringify(listings));
  return listings;
}
```

---

## 📊 Monitoring

### 1. Métriques Applicatives

```typescript
// Métriques personnalisées
export const metrics = {
  // Compteurs
  transactionCount: new Counter('transactions_total'),
  userRegistrations: new Counter('user_registrations_total'),
  
  // Histogrammes
  transactionDuration: new Histogram('transaction_duration_seconds'),
  apiResponseTime: new Histogram('api_response_time_seconds'),
  
  // Jauges
  activeUsers: new Gauge('active_users_current'),
  pendingTransactions: new Gauge('pending_transactions_current'),
};
```

### 2. Logging Structuré

```typescript
// Configuration des logs
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### 3. Health Checks

```typescript
// Endpoint de santé
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    external_apis: await checkExternalAPIs(),
  };
  
  const isHealthy = Object.values(checks).every(check => check.status === 'ok');
  
  return Response.json(
    { status: isHealthy ? 'healthy' : 'unhealthy', checks },
    { status: isHealthy ? 200 : 503 }
  );
}
```

---

## 🔧 Configuration des Environnements

### 1. Développement

```env
# .env.development
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5433/lebonkoin_dev
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
```

### 2. Test

```env
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://user:pass@localhost:5434/lebonkoin_test
REDIS_URL=redis://localhost:6380
LOG_LEVEL=error
```

### 3. Production

```env
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/lebonkoin
REDIS_URL=redis://prod-redis:6379
LOG_LEVEL=info
SENTRY_DSN=https://...
```

---

## 🚀 Déploiement

### 1. Docker Compose (Développement)

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: lebonkoin
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
  
  redis:
    image: redis:7-alpine
```

### 2. Kubernetes (Production)

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lebonkoin-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lebonkoin-app
  template:
    metadata:
      labels:
        app: lebonkoin-app
    spec:
      containers:
      - name: app
        image: lebonkoin:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

---

## 🧪 Tests

### 1. Tests Unitaires

```typescript
// __tests__/services/cctp.test.ts
describe('CCTPService', () => {
  it('should initiate CCTP transfer', async () => {
    const mockSigner = jest.fn();
    const service = new CCTPService();
    
    const result = await service.initiateCCTPTransfer({
      amount: parseUnits('100', 6),
      sourceChain: 11155111,
      targetChain: 84532,
      recipient: '0x123...',
      signer: mockSigner,
    });
    
    expect(result.messageHash).toBeDefined();
  });
});
```

### 2. Tests d'Intégration

```typescript
// __tests__/api/listings.test.ts
describe('/api/listings', () => {
  it('should create a new listing', async () => {
    const response = await request(app)
      .post('/api/listings')
      .send({
        title: 'Test Product',
        description: 'Test Description',
        price: 100,
        currency: 'USDC',
        categoryId: 'category-id',
      })
      .expect(201);
    
    expect(response.body.id).toBeDefined();
  });
});
```

---

## 📈 Scalabilité

### 1. Horizontal Scaling

```typescript
// Configuration de load balancing
export const loadBalancerConfig = {
  strategy: 'round-robin',
  healthCheck: '/api/health',
  instances: [
    { host: 'app1.example.com', port: 3000 },
    { host: 'app2.example.com', port: 3000 },
    { host: 'app3.example.com', port: 3000 },
  ],
};
```

### 2. Database Sharding

```prisma
// Sharding par région
model Listing {
  id       String @id @default(cuid())
  region   String
  // ...
  
  @@map("listings")
  @@index([region])
}
```

### 3. CDN Configuration

```typescript
// Configuration CDN pour les assets
export const cdnConfig = {
  images: 'https://cdn.lebonkoin.com/images/',
  static: 'https://cdn.lebonkoin.com/static/',
  api: 'https://api.lebonkoin.com/',
};
```

---

## 🔍 Troubleshooting

### 1. Problèmes Courants

```bash
# Vérifier les logs
docker logs lebonkoin-app

# Vérifier la connectivité DB
npx prisma db pull

# Vérifier Redis
redis-cli ping

# Vérifier les métriques
curl http://localhost:3000/api/metrics
```

### 2. Debug Mode

```typescript
// Mode debug pour développement
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode enabled');
  // Logs détaillés
  // Métriques supplémentaires
  // Endpoints de debug
}
```

---

Cette architecture garantit une application robuste, scalable et maintenable, prête pour une utilisation en production avec tous les outils nécessaires pour le monitoring et la maintenance. 