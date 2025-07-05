import { Address } from "viem";
import { createPublicClient, createWalletClient, http, encodeFunctionData, parseUnits, formatUnits } from 'viem';
import { mainnet, base, arbitrum, avalanche, linea, optimism, polygon, sepolia, baseSepolia, arbitrumSepolia, avalancheFuji, lineaSepolia } from 'viem/chains';
import axios from 'axios';

// Configuration CCTP V2 - Adresses des contrats sur mainnet
export const CCTP_V2_CONTRACTS = {
  // Ethereum (Domain 0)
  1: {
    domain: 0,
    TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" as Address,
    MessageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64" as Address,
    TokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002" as Address,
    USDC: "0xA0b86a33E6441c9C8c4A4F6F8c3F3b5f7f4b3b3b" as Address, // USDC sur Ethereum
  },
  // Base (Domain 6)
  8453: {
    domain: 6,
    TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" as Address,
    MessageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64" as Address,
    TokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002" as Address,
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address, // USDC sur Base
  },
  // Arbitrum (Domain 3)
  42161: {
    domain: 3,
    TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" as Address,
    MessageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64" as Address,
    TokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002" as Address,
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address, // USDC sur Arbitrum
  },
  // Avalanche (Domain 1)
  43114: {
    domain: 1,
    TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" as Address,
    MessageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64" as Address,
    TokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002" as Address,
    USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" as Address, // USDC sur Avalanche
  },
  // Linea (Domain 11)
  59144: {
    domain: 11,
    TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" as Address,
    MessageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64" as Address,
    TokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002" as Address,
    USDC: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff" as Address, // USDC sur Linea
  },
  // World Chain (Domain 14)
  480: {
    domain: 14,
    TokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" as Address,
    MessageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64" as Address,
    TokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002" as Address,
    USDC: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1" as Address, // USDC sur World Chain
  },
} as const;

// Configuration des domaines CCTP V2 (testnet + mainnet)
export const CCTP_DOMAINS = {
  // TESTNETS
  [sepolia.id]: 0,           // Ethereum Sepolia
  [avalancheFuji.id]: 1,     // Avalanche Fuji
  [baseSepolia.id]: 6,       // Base Sepolia
  [arbitrumSepolia.id]: 3,   // Arbitrum Sepolia
  [lineaSepolia.id]: 9,      // Linea Sepolia
  
  // MAINNETS (ajoutés pour le support production)
  1: 0,     // Ethereum Mainnet
  8453: 6,  // Base Mainnet  
  42161: 3, // Arbitrum One
  43114: 1, // Avalanche C-Chain
  10: 2,    // Optimism
  137: 7,   // Polygon PoS
  59144: 11, // Linea
} as const;

// Adresses des contrats CCTP V2 (testnet + mainnet)
export const CCTP_CONTRACTS = {
  // TESTNETS (CCTP V2 officielles de Circle)
  [sepolia.id]: {
    tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA', // ✅ CCTP V2 Sepolia
    messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275', // ✅ CCTP V2 Sepolia
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // USDC Sepolia officiel
  },
  [avalancheFuji.id]: {
    tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA', // ✅ CCTP V2 Fuji
    messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275', // ✅ CCTP V2 Fuji
    usdc: '0x5425890298aed601595a70AB815c96711a31Bc65' // USDC Fuji officiel
  },
  [baseSepolia.id]: {
    tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA', // ✅ CCTP V2 Base Sepolia
    messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275', // ✅ CCTP V2 Base Sepolia
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // USDC Base Sepolia officiel
  },
  [arbitrumSepolia.id]: {
    tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA', // ✅ CCTP V2 Arbitrum Sepolia
    messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275', // ✅ CCTP V2 Arbitrum Sepolia
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d' // USDC Arbitrum Sepolia officiel
  },
  [lineaSepolia.id]: {
    tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA', // ✅ CCTP V2 Linea Sepolia
    messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275', // ✅ CCTP V2 Linea Sepolia
    usdc: '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7' // USDC Linea Sepolia officiel
  },
  
  // MAINNETS (CCTP V2 officielles de Circle)
  1: { // Ethereum Mainnet
    tokenMessenger: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d', // ✅ CCTP V2 Mainnet
    messageTransmitter: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64', // ✅ CCTP V2 Mainnet
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC Mainnet officiel
  },
  8453: { // Base Mainnet
    tokenMessenger: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d', // ✅ CCTP V2 Mainnet
    messageTransmitter: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64', // ✅ CCTP V2 Mainnet
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // USDC Base Mainnet
  },
  42161: { // Arbitrum One
    tokenMessenger: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d', // ✅ CCTP V2 Mainnet
    messageTransmitter: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64', // ✅ CCTP V2 Mainnet
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' // USDC Arbitrum Mainnet
  },
  43114: { // Avalanche C-Chain
    tokenMessenger: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d', // ✅ CCTP V2 Mainnet
    messageTransmitter: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64', // ✅ CCTP V2 Mainnet
    usdc: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' // USDC Avalanche Mainnet
  },
  10: { // Optimism
    tokenMessenger: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d', // ✅ CCTP V2 Mainnet
    messageTransmitter: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64', // ✅ CCTP V2 Mainnet
    usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' // USDC Optimism (celui de votre transaction!)
  },
  137: { // Polygon PoS
    tokenMessenger: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d', // ✅ CCTP V2 Mainnet
    messageTransmitter: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64', // ✅ CCTP V2 Mainnet
    usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' // USDC Polygon Mainnet
  },
  59144: { // Linea
    tokenMessenger: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d', // ✅ CCTP V2 Mainnet
    messageTransmitter: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64', // ✅ CCTP V2 Mainnet
    usdc: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff' // USDC Linea Mainnet
  }
} as const;

// Types pour CCTP V2 (bas niveau)
export interface CCTPLowLevelParams {
  amount: bigint;
  destinationDomain: number;
  mintRecipient: Address;
  destinationCaller?: Address;
  maxFee: bigint;
  minFinalityThreshold: number; // 1000 = Fast Transfer, 2000 = Standard Transfer
  hookData?: `0x${string}`;
}

// Configuration pour Fast Transfer (8-20 secondes)
export const FAST_TRANSFER_CONFIG = {
  minFinalityThreshold: 1000,
  maxFee: BigInt("1000000"), // 1 USDC en wei (6 decimales)
} as const;

// Configuration pour Standard Transfer (13-19 minutes)
export const STANDARD_TRANSFER_CONFIG = {
  minFinalityThreshold: 2000,
  maxFee: BigInt("0"), // Gratuit
} as const;

export function getCCTPConfig(chainId: number) {
  const config = CCTP_V2_CONTRACTS[chainId as keyof typeof CCTP_V2_CONTRACTS];
  if (!config) {
    throw new Error(`CCTP V2 non supporté sur la chaîne ${chainId}`);
  }
  return config;
}

export function isFastTransferSupported(chainId: number): boolean {
  // Fast Transfer supporté sur toutes les chaînes sauf Avalanche et Sonic en destination
  const fastTransferSupportedChains = [1, 8453, 42161, 59144, 480]; // Ethereum, Base, Arbitrum, Linea, World Chain
  return fastTransferSupportedChains.includes(chainId);
}

// Types pour CCTP
export interface CCTPTransferParams {
  fromChain: number;
  toChain: number;
  amount: string; // En USDC (par exemple "100.5")
  recipient: `0x${string}`;
  signer?: any; // Wallet signer
}

export interface CCTPTransferResult {
  txHash: string;
  messageHash: string;
  attestation?: string;
  status: 'pending' | 'completed' | 'failed';
}

// ABI pour les contrats CCTP
const TOKEN_MESSENGER_ABI = [
  {
    type: 'function',
    name: 'depositForBurn',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'mintRecipient', type: 'bytes32' },
      { name: 'burnToken', type: 'address' },
      { name: 'destinationCaller', type: 'bytes32' },
      { name: 'maxFee', type: 'uint256' },
      { name: 'minFinalityThreshold', type: 'uint32' }
    ],
    outputs: [{ name: 'nonce', type: 'uint64' }]
  }
] as const;

const MESSAGE_TRANSMITTER_ABI = [
  {
    type: 'function',
    name: 'receiveMessage',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'message', type: 'bytes' },
      { name: 'attestation', type: 'bytes' }
    ],
    outputs: [{ name: 'success', type: 'bool' }]
  }
] as const;

const USDC_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: 'success', type: 'bool' }]
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: 'allowance', type: 'uint256' }]
  }
] as const;

// Classe pour gérer les transferts CCTP V2
export class CCTPService {
  private clients: Map<number, any> = new Map();

  constructor() {
    // Initialiser les clients pour chaque chaîne
    this.initializeClients();
  }

  private initializeClients() {
    // Support testnet ET mainnet pour les transferts CCTP
    const allChains = [
      // TESTNETS
      sepolia, baseSepolia, arbitrumSepolia, avalancheFuji, lineaSepolia,
      // MAINNETS  
      mainnet, base, arbitrum, avalanche, optimism, polygon, linea
    ];
    
    allChains.forEach(chain => {
      const client = createPublicClient({
        chain,
        transport: http()
      });
      this.clients.set(chain.id, client);
      console.log(`📱 Client initialisé pour ${chain.name} (${chain.id})`);
    });
  }

  // Vérifier si CCTP est supporté entre deux chaînes
  public isSupportedRoute(fromChain: number, toChain: number): boolean {
    return fromChain in CCTP_DOMAINS && toChain in CCTP_DOMAINS && fromChain !== toChain;
  }

  // Obtenir le solde USDC d'un utilisateur
  public async getUSDCBalance(chainId: number, address: `0x${string}`): Promise<string> {
    const client = this.clients.get(chainId);
    const contracts = CCTP_CONTRACTS[chainId as keyof typeof CCTP_CONTRACTS];
    
    if (!client) {
      console.warn(`Client non trouvé pour la chaîne ${chainId}. Chaînes disponibles:`, Array.from(this.clients.keys()));
      throw new Error(`Client non trouvé pour la chaîne ${chainId}`);
    }
    
    if (!contracts) {
      console.warn(`Contrats non trouvés pour la chaîne ${chainId}. Chaînes supportées:`, Object.keys(CCTP_CONTRACTS));
      throw new Error(`Contrats non trouvés pour la chaîne ${chainId}`);
    }

    console.log(`Tentative de lecture du solde USDC sur la chaîne ${chainId}:`, {
      chainId,
      usdcAddress: contracts.usdc,
      userAddress: address
    });

    try {
      const balance = await client.readContract({
        address: contracts.usdc,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [address]
      });

      const formattedBalance = formatUnits(balance, 6);
      console.log(`Solde USDC récupéré pour la chaîne ${chainId}:`, formattedBalance);
      return formattedBalance;
    } catch (error: any) {
      console.error(`Erreur lors de la lecture du solde USDC sur la chaîne ${chainId}:`, {
        error: error.message,
        chainId,
        usdcAddress: contracts.usdc,
        userAddress: address
      });
      
      // Pour le hackathon, retourner 0 au lieu de lancer une erreur
      return '0';
    }
  }

  // Vérifier l'allowance USDC
  public async checkUSDCAllowance(
    chainId: number, 
    owner: `0x${string}`, 
    spender: `0x${string}`
  ): Promise<string> {
    const client = this.clients.get(chainId);
    const contracts = CCTP_CONTRACTS[chainId as keyof typeof CCTP_CONTRACTS];
    
    if (!client || !contracts) {
      throw new Error(`Chaîne non supportée: ${chainId}`);
    }

    const allowance = await client.readContract({
      address: contracts.usdc,
      abi: USDC_ABI,
      functionName: 'allowance',
      args: [owner, spender]
    });

    return formatUnits(allowance, 6);
  }

  // Approuver USDC pour le TokenMessenger (montant + frais CCTP)
  public async approveUSDC(
    chainId: number,
    amount: string,
    signer: any
  ): Promise<string> {
    const contracts = CCTP_CONTRACTS[chainId as keyof typeof CCTP_CONTRACTS];
    
    if (!contracts) {
      throw new Error(`Chaîne non supportée: ${chainId}`);
    }

    const amountWei = parseUnits(amount, 6);
    
    // 🔥 CORRECTION: Calculer les frais CCTP pour l'approbation
    const calculatedFee = amountWei / BigInt(100); // 1% du montant
    const maxAllowedFee = parseUnits('0.01', 6); // 0.01 USDC max
    const maxFee = calculatedFee < maxAllowedFee ? calculatedFee : maxAllowedFee;
    
    // Approuver montant + frais maximum
    const totalApproval = amountWei + maxFee;

    console.log(`💰 Approbation USDC: ${amount} USDC + ${formatUnits(maxFee, 6)} frais = ${formatUnits(totalApproval, 6)} USDC total`);

    const txData = encodeFunctionData({
      abi: USDC_ABI,
      functionName: 'approve',
      args: [contracts.tokenMessenger, totalApproval]
    });

    // Retourner les données de transaction pour signature
    return txData;
  }

  // Initier un transfert CCTP V2
  public async initiateCCTPTransfer(params: CCTPTransferParams): Promise<string> {
    const { fromChain, toChain, amount, recipient } = params;
    
    if (!this.isSupportedRoute(fromChain, toChain)) {
      throw new Error(`Route non supportée: ${fromChain} -> ${toChain}`);
    }

    // 🔥 PROTECTION: Vérifier que le recipient n'est pas l'adresse zéro
    if (!recipient || recipient === '0x0000000000000000000000000000000000000000') {
      throw new Error('❌ Adresse du destinataire invalide ou manquante');
    }

    const contracts = CCTP_CONTRACTS[fromChain as keyof typeof CCTP_CONTRACTS];
    const destinationDomain = CCTP_DOMAINS[toChain as keyof typeof CCTP_DOMAINS];
    
    if (!contracts) {
      throw new Error(`Contrats non trouvés pour la chaîne ${fromChain}`);
    }

    const amountWei = parseUnits(amount, 6);
    
    // Convertir l'adresse recipient en bytes32
    const mintRecipient = `0x${'0'.repeat(24)}${recipient.slice(2)}` as `0x${string}`;
    
    // 🔥 CCTP V2 : Paramètres supplémentaires requis
    const destinationCaller = `0x${'0'.repeat(64)}` as `0x${string}`; // bytes32(0) = pas de caller spécifique
    
    // 💡 Calcul dynamique des frais : min(1% du montant, 0.01 USDC)
    const calculatedFee = amountWei / BigInt(100); // 1% du montant
    const maxAllowedFee = parseUnits('0.01', 6); // 0.01 USDC max
    const maxFee = calculatedFee < maxAllowedFee ? calculatedFee : maxAllowedFee;
    
    const minFinalityThreshold = 1000; // Fast Transfer (< 2000)

    console.log(`🔄 Paramètres CCTP V2:`, {
      amount: amountWei.toString(),
      destinationDomain,
      mintRecipient,
      burnToken: contracts.usdc,
      destinationCaller,
      maxFee: maxFee.toString(),
      minFinalityThreshold
    });

    const txData = encodeFunctionData({
      abi: TOKEN_MESSENGER_ABI,
      functionName: 'depositForBurn',
      args: [
        amountWei,              // amount (uint256)
        destinationDomain,      // destinationDomain (uint32)
        mintRecipient,          // mintRecipient (bytes32)
        contracts.usdc,         // burnToken (address)
        destinationCaller,      // destinationCaller (bytes32)
        maxFee,                 // maxFee (uint256)
        minFinalityThreshold    // minFinalityThreshold (uint32)
      ]
    });

    return txData;
  }

  // Récupérer l'attestation Circle
  public async getAttestation(txHash: string, fromChain: number): Promise<string> {
    const domain = CCTP_DOMAINS[fromChain as keyof typeof CCTP_DOMAINS];
    
    // 🔥 CORRECTION PRINCIPALE: Détecter automatiquement mainnet vs testnet
    const isMainnet = this.isMainnetChain(fromChain);
    const apiBaseUrl = isMainnet 
      ? 'https://iris-api.circle.com'        // API PRODUCTION pour mainnet
      : 'https://iris-api-sandbox.circle.com'; // API SANDBOX pour testnet
    
    const url = `${apiBaseUrl}/v2/messages/${domain}?transactionHash=${txHash}`;
    
    console.log(`📍 Chaîne source: ${fromChain} (${isMainnet ? 'MAINNET' : 'TESTNET'})`);
    console.log(`🌐 Domaine CCTP: ${domain}`);
    console.log(`🔗 API Circle: ${apiBaseUrl}`);
    console.log(`🔍 Recherche attestation pour transaction ${txHash}`);
    console.log(`📡 URL complète:`, url);
    
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max
    
    while (attempts < maxAttempts) {
      try {
        console.log(`Tentative ${attempts + 1}: Vérification de l'attestation...`);
        const response = await axios.get(url);
        
        console.log(`📊 Réponse Circle API:`, response.data);
        
        if (response.data?.messages?.[0]?.status === 'complete') {
          console.log(`✅ Attestation trouvée !`);
          return response.data.messages[0].attestation;
        }
        
        if (response.data?.messages?.[0]) {
          console.log(`⏳ Status actuel:`, response.data.messages[0].status);
        }
        
        // Attendre 10 secondes avant de réessayer  
        console.log(`⏰ Attente de 10 secondes avant la prochaine tentative...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;
      } catch (error: any) {
        console.log(`Tentative ${attempts + 1}: En attente de l'attestation...`);
        if (error.response?.status === 404) {
          console.log(`⏳ Transaction pas encore indexée par Circle (404 normal)`);
        } else {
          console.error(`❌ Erreur API Circle:`, error.message);
        }
        
        // Attendre moins longtemps au début (Circle peut être lent à indexer)
        const waitTime = attempts < 5 ? 5000 : 10000; // 5s pour les 5 premières tentatives, puis 10s
        console.log(`⏰ Attente de ${waitTime/1000}s avant la prochaine tentative...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        attempts++;
      }
    }
    
    throw new Error('Timeout: Attestation non reçue après 5 minutes');
  }

  // 🆕 Méthode pour détecter si c'est un réseau mainnet
  private isMainnetChain(chainId: number): boolean {
    const mainnetChains = [
      1,     // Ethereum Mainnet
      8453,  // Base Mainnet  
      42161, // Arbitrum One
      43114, // Avalanche C-Chain
      137,   // Polygon PoS
      10,    // Optimism
      59144, // Linea
      324,   // zkSync Era
      480,   // World Chain
    ];
    return mainnetChains.includes(chainId);
  }

  // Compléter le transfert sur la chaîne de destination
  public async completeCCTPTransfer(
    toChain: number,
    message: string,
    attestation: string
  ): Promise<string> {
    const contracts = CCTP_CONTRACTS[toChain as keyof typeof CCTP_CONTRACTS];
    
    if (!contracts) {
      throw new Error(`Contrats non trouvés pour la chaîne ${toChain}`);
    }

    const txData = encodeFunctionData({
      abi: MESSAGE_TRANSMITTER_ABI,
      functionName: 'receiveMessage',
      args: [message as `0x${string}`, attestation as `0x${string}`]
    });

    return txData;
  }

  // Obtenir les informations sur une chaîne
  public getChainInfo(chainId: number) {
    const chainMap = {
      // TESTNETS
      [sepolia.id]: { name: 'Ethereum Sepolia', symbol: 'ETH', color: '#627EEA' },
      [baseSepolia.id]: { name: 'Base Sepolia', symbol: 'ETH', color: '#0052FF' },
      [arbitrumSepolia.id]: { name: 'Arbitrum Sepolia', symbol: 'ETH', color: '#28A0F0' },
      [avalancheFuji.id]: { name: 'Avalanche Fuji', symbol: 'AVAX', color: '#E84142' },
      [lineaSepolia.id]: { name: 'Linea Sepolia', symbol: 'ETH', color: '#121212' },
      
      // MAINNETS
      [mainnet.id]: { name: 'Ethereum', symbol: 'ETH', color: '#627EEA' },
      [base.id]: { name: 'Base', symbol: 'ETH', color: '#0052FF' },
      [arbitrum.id]: { name: 'Arbitrum One', symbol: 'ETH', color: '#28A0F0' },
      [avalanche.id]: { name: 'Avalanche', symbol: 'AVAX', color: '#E84142' },
      [optimism.id]: { name: 'Optimism', symbol: 'ETH', color: '#FF0420' },
      [polygon.id]: { name: 'Polygon', symbol: 'MATIC', color: '#8247E5' },
      [linea.id]: { name: 'Linea', symbol: 'ETH', color: '#121212' }
    };

    return chainMap[chainId as keyof typeof chainMap] || null;
  }

  // Calculer les frais estimés pour un transfert
  public async estimateTransferFees(fromChain: number, toChain: number, amount: string): Promise<{
    networkFee: string;
    bridgeFee: string;
    total: string;
  }> {
    // Pour le hackathon, utilisons des frais estimés
    const networkFee = '0.01'; // ETH/AVAX pour gas
    const bridgeFee = '0.1';   // USDC pour Circle
    const total = (parseFloat(networkFee) + parseFloat(bridgeFee)).toString();

    return { networkFee, bridgeFee, total };
  }
}

// Instance singleton
export const cctpService = new CCTPService(); 