import { Chain } from 'viem';
import { 
  arbitrumSepolia, 
  sepolia, 
  baseSepolia, 
  optimismSepolia,
  polygonAmoy
} from 'viem/chains';

// Configuration des bundlers ERC-4337 disponibles
export const BUNDLER_ENDPOINTS = {
  [sepolia.id]: {
    rpcUrl: 'https://api.pimlico.io/v1/sepolia/rpc?apikey=pim_HHS3GXSj6EK4G8f93c7Six',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    name: 'Pimlico Ethereum Sepolia'
  },
  [arbitrumSepolia.id]: {
    rpcUrl: 'https://api.pimlico.io/v1/arbitrum-sepolia/rpc?apikey=pim_HHS3GXSj6EK4G8f93c7Six', 
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    name: 'Pimlico Arbitrum Sepolia'
  },
  [baseSepolia.id]: {
    rpcUrl: 'https://api.pimlico.io/v1/base-sepolia/rpc?apikey=pim_HHS3GXSj6EK4G8f93c7Six',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', 
    name: 'Pimlico Base Sepolia'
  },
  [optimismSepolia.id]: {
    rpcUrl: 'https://api.pimlico.io/v1/optimism-sepolia/rpc?apikey=pim_HHS3GXSj6EK4G8f93c7Six',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    name: 'Pimlico Optimism Sepolia'
  },
  [polygonAmoy.id]: {
    rpcUrl: 'https://api.pimlico.io/v1/polygon-amoy/rpc?apikey=pim_HHS3GXSj6EK4G8f93c7Six',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    name: 'Pimlico Polygon Amoy'
  }
} as const;

// Adresses des contrats Circle Paymaster (officielles selon Circle)
// Circle Paymaster est disponible uniquement sur Arbitrum et Base (janvier 2025)
export const CIRCLE_PAYMASTER_ADDRESSES = {
  // Ethereum Sepolia - Circle Paymaster non disponible
  // [sepolia.id]: '0xa1C2bf1d35154a36c5eC4e27d178391AEC72419e',
  
  // Arbitrum Sepolia - Circle Paymaster officiel (à confirmer l'adresse)
  [arbitrumSepolia.id]: '0x1234567890123456789012345678901234567890', // À remplacer par l'adresse officielle
  
  // Base Sepolia - Circle Paymaster officiel (à confirmer l'adresse)  
  [baseSepolia.id]: '0x2345678901234567890123456789012345678901', // À remplacer par l'adresse officielle
  
  // Autres réseaux non supportés par Circle Paymaster officiel
  // [optimismSepolia.id]: '0x4567890123456789012345678901234567890123',
  // [polygonAmoy.id]: '0x5678901234567890123456789012345678901234',
} as const;

// Adresses des SimpleAccountFactory (pour créer les smart accounts)
export const SIMPLE_ACCOUNT_FACTORY_ADDRESSES = {
  [sepolia.id]: '0x9406Cc6185a346906296840746125a0E44976454',
  [arbitrumSepolia.id]: '0x9406Cc6185a346906296840746125a0E44976454', 
  [baseSepolia.id]: '0x9406Cc6185a346906296840746125a0E44976454',
  [optimismSepolia.id]: '0x9406Cc6185a346906296840746125a0E44976454',
  [polygonAmoy.id]: '0x9406Cc6185a346906296840746125a0E44976454',
} as const;

export interface UserOperation {
  sender: `0x${string}`;
  nonce: bigint;
  initCode: `0x${string}`;
  callData: `0x${string}`;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: `0x${string}`;
  signature: `0x${string}`;
}

export interface BundlerService {
  estimateUserOperationGas(userOp: Partial<UserOperation>): Promise<{
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
  }>;
  sendUserOperation(userOp: UserOperation): Promise<`0x${string}`>;
  getUserOperationReceipt(userOpHash: `0x${string}`): Promise<any>;
  getSupportedEntryPoints(): Promise<`0x${string}`[]>;
}

export class ERC4337BundlerService implements BundlerService {
  private rpcUrl: string;
  private entryPoint: `0x${string}`;

  constructor(chainId: number) {
    const config = BUNDLER_ENDPOINTS[chainId as keyof typeof BUNDLER_ENDPOINTS];
    if (!config) {
      throw new Error(`Bundler non supporté pour la chaîne ${chainId}`);
    }
    this.rpcUrl = config.rpcUrl;
    this.entryPoint = config.entryPoint as `0x${string}`;
  }

  async estimateUserOperationGas(userOp: Partial<UserOperation>) {
    // Convertir les BigInt en hex strings pour JSON
    const serializedUserOp = this.serializeUserOperation(userOp);
    
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_estimateUserOperationGas',
        params: [serializedUserOp, this.entryPoint]
      })
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(`Erreur estimation gas: ${result.error.message}`);
    }

    return {
      callGasLimit: BigInt(result.result.callGasLimit),
      verificationGasLimit: BigInt(result.result.verificationGasLimit), 
      preVerificationGas: BigInt(result.result.preVerificationGas)
    };
  }

  /**
   * Sérialise une UserOperation en convertissant les BigInt en hex strings
   */
  private serializeUserOperation(userOp: Partial<UserOperation>): any {
    const serialized: any = {};
    
    for (const [key, value] of Object.entries(userOp)) {
      if (typeof value === 'bigint') {
        serialized[key] = '0x' + value.toString(16);
      } else {
        serialized[key] = value;
      }
    }
    
    console.log('🔧 UserOperation sérialisée:', {
      original: Object.fromEntries(
        Object.entries(userOp).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : v])
      ),
      serialized
    });
    
    return serialized;
  }

  async sendUserOperation(userOp: UserOperation): Promise<`0x${string}`> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendUserOperation',
        params: [
          {
            sender: userOp.sender,
            nonce: '0x' + userOp.nonce.toString(16),
            initCode: userOp.initCode,
            callData: userOp.callData,
            callGasLimit: '0x' + userOp.callGasLimit.toString(16),
            verificationGasLimit: '0x' + userOp.verificationGasLimit.toString(16),
            preVerificationGas: '0x' + userOp.preVerificationGas.toString(16),
            maxFeePerGas: '0x' + userOp.maxFeePerGas.toString(16),
            maxPriorityFeePerGas: '0x' + userOp.maxPriorityFeePerGas.toString(16),
            paymasterAndData: userOp.paymasterAndData,
            signature: userOp.signature
          },
          this.entryPoint
        ]
      })
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(`Erreur envoi UserOp: ${result.error.message}`);
    }

    return result.result as `0x${string}`;
  }

  async getUserOperationReceipt(userOpHash: `0x${string}`) {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getUserOperationReceipt',
        params: [userOpHash]
      })
    });

    const result = await response.json();
    return result.result;
  }

  async getSupportedEntryPoints(): Promise<`0x${string}`[]> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_supportedEntryPoints',
        params: []
      })
    });

    const result = await response.json();
    return result.result;
  }
}

export function getBundlerService(chainId: number): ERC4337BundlerService {
  return new ERC4337BundlerService(chainId);
}

export function isChainSupported(chainId: number): boolean {
  return chainId in BUNDLER_ENDPOINTS;
} 