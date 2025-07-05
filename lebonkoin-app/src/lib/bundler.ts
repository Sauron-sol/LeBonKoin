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
    rpcUrl: 'https://api.stackup.sh/v1/node/ethereum-sepolia',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    name: 'Stackup Ethereum Sepolia'
  },
  [arbitrumSepolia.id]: {
    rpcUrl: 'https://api.stackup.sh/v1/node/arbitrum-sepolia', 
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    name: 'Stackup Arbitrum Sepolia'
  },
  [baseSepolia.id]: {
    rpcUrl: 'https://api.stackup.sh/v1/node/base-sepolia',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', 
    name: 'Stackup Base Sepolia'
  },
  [optimismSepolia.id]: {
    rpcUrl: 'https://api.stackup.sh/v1/node/optimism-sepolia',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    name: 'Stackup Optimism Sepolia'
  },
  [polygonAmoy.id]: {
    rpcUrl: 'https://api.stackup.sh/v1/node/polygon-amoy',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    name: 'Stackup Polygon Amoy'
  }
} as const;

// Adresses des contrats Circle Paymaster
export const CIRCLE_PAYMASTER_ADDRESSES = {
  [sepolia.id]: '0x0000000000000000000000000000000000000000', // À deployer
  [arbitrumSepolia.id]: '0x0000000000000000000000000000000000000000', // À deployer
  [baseSepolia.id]: '0x0000000000000000000000000000000000000000', // À deployer
  [optimismSepolia.id]: '0x0000000000000000000000000000000000000000', // À deployer
  [polygonAmoy.id]: '0x0000000000000000000000000000000000000000', // À deployer
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
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_estimateUserOperationGas',
        params: [userOp, this.entryPoint]
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