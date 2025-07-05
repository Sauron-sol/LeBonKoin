import { createPublicClient, http, getContract, Address, Hex, encodeFunctionData } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { toCircleSmartAccount } from '@circle-fin/modular-wallets-core';
import { createBundlerClient, toSimple7702SmartAccount } from 'viem/account-abstraction';

// Adresses des contrats Circle Paymaster sur les testnets
export const CIRCLE_PAYMASTER_CONFIG = {
  sepolia: {
    paymaster: '0x31BE08D380A21fc740883c0BC434FcFc88740b58' as Address, // Paymaster v0.7
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as Address, // USDC Sepolia
    bundlerUrl: 'https://api.stackup.sh/v1/node/ethereum-sepolia',
  },
  arbitrumSepolia: {
    paymaster: '0x31BE08D380A21fc740883c0BC434FcFc88740b58' as Address, // Paymaster v0.7
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d' as Address,
    bundlerUrl: 'https://api.stackup.sh/v1/node/arbitrum-sepolia',
  },
};

// ABI minimal pour les interactions USDC
const USDC_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

// Types pour les paramètres de paiement gasless
export interface GaslessPaymentParams {
  to: Address;
  value?: bigint;
  data?: Hex;
  userPrivateKey: Hex;
}

export interface SmartAccountInfo {
  address: Address;
  usdcBalance: bigint;
  gasBalance: bigint;
  isGaslessEnabled: boolean;
}

export class CirclePaymasterService {
  private client = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });

  private bundlerClient = createBundlerClient({
    chain: arbitrumSepolia,
    transport: http(CIRCLE_PAYMASTER_CONFIG.arbitrumSepolia.bundlerUrl),
  });

  private config = CIRCLE_PAYMASTER_CONFIG.arbitrumSepolia;

  /**
   * Crée un smart account Circle pour l'utilisateur
   */
  async createSmartAccount(privateKey: Hex) {
    try {
      const owner = privateKeyToAccount(privateKey);
      
      // Créer un smart account Circle avec support Paymaster
      const account = await toCircleSmartAccount({
        client: this.client,
        owner,
      });

      return account;
    } catch (error) {
      console.error('Erreur création smart account:', error);
      throw new Error('Impossible de créer le smart account');
    }
  }

  /**
   * Crée un smart account EIP-7702 (version alternative)
   */
  async createEIP7702Account(privateKey: Hex) {
    try {
      const owner = privateKeyToAccount(privateKey);
      
      const account = await toSimple7702SmartAccount({
        client: this.client,
        owner,
      });

      return account;
    } catch (error) {
      console.error('Erreur création EIP-7702 account:', error);
      throw new Error('Impossible de créer le EIP-7702 account');
    }
  }

  /**
   * Récupère les informations du smart account
   */
  async getSmartAccountInfo(address: Address): Promise<SmartAccountInfo> {
    try {
      // Récupérer le solde USDC
      const usdcContract = getContract({
        address: this.config.usdc,
        abi: USDC_ABI,
        client: this.client,
      });

      const usdcBalance = await usdcContract.read.balanceOf([address]);
      
      // Récupérer le solde ETH natif
      const gasBalance = await this.client.getBalance({
        address: address,
      });

      // Vérifier si le paymaster a une allowance
      const allowance = await usdcContract.read.allowance([
        address,
        this.config.paymaster,
      ]);

      const isGaslessEnabled = allowance > BigInt(0);

      return {
        address,
        usdcBalance,
        gasBalance,
        isGaslessEnabled,
      };
    } catch (error) {
      console.error('Erreur récupération info smart account:', error);
      throw new Error('Impossible de récupérer les informations du smart account');
    }
  }

  /**
   * Active le mode gasless en approuvant le paymaster
   */
  async enableGaslessMode(privateKey: Hex, amount: bigint = BigInt(10000 * Math.pow(10, 6))) {
    try {
      // Préparer la transaction d'approbation USDC
      const approveData = encodeFunctionData({
        abi: USDC_ABI,
        functionName: 'approve',
        args: [this.config.paymaster, amount]
      });

      // Retourner les données de transaction pour être exécutées via UserOperation
      return {
        to: this.config.usdc,
        data: approveData,
        value: BigInt(0)
      };
    } catch (error) {
      console.error('Erreur activation gasless:', error);
      throw new Error('Impossible d\'activer le mode gasless');
    }
  }

  /**
   * Exécute un paiement gasless (frais payés en USDC)
   */
  async executeGaslessPayment(params: GaslessPaymentParams) {
    try {
      const account = privateKeyToAccount(params.userPrivateKey);
      
      // Vérifier que le mode gasless est activé
      const info = await this.getSmartAccountInfo(account.address);
      if (!info.isGaslessEnabled) {
        throw new Error('Mode gasless non activé. Appelez enableGaslessMode() d\'abord.');
      }

      // Retourner les données de transaction avec support Paymaster
      return {
        to: params.to,
        value: params.value || BigInt(0),
        data: params.data || '0x',
        paymasterAndData: `${this.config.paymaster}${'0'.repeat(64)}` // Paymaster address + data
      };
    } catch (error) {
      console.error('Erreur paiement gasless:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Échec du paiement gasless: ${errorMessage}`);
    }
  }

  /**
   * Estime le coût du gas en USDC (approximation)
   */
  private estimateGasCostInUSDC(gasUsed: bigint): string {
    // Estimation: 1 ETH ≈ 3000 USDC, gas price moyen ≈ 20 gwei
    const gasPrice = BigInt(20) * BigInt(Math.pow(10, 9)); // 20 gwei
    const gasCostInWei = gasUsed * gasPrice;
    const gasCostInUSDC = (gasCostInWei * BigInt(3000)) / BigInt(Math.pow(10, 18));
    
    return (Number(gasCostInUSDC) / Math.pow(10, 6)).toFixed(6); // Format USDC (6 décimales)
  }

  /**
   * Vérifie si une chaîne supporte Circle Paymaster
   */
  isChainSupported(chainId: number): boolean {
    // Chaînes supportées selon la doc Circle
    const supportedChains = [
      1,      // Ethereum
      10,     // Optimism  
      8453,   // Base
      42161,  // Arbitrum
      137,    // Polygon
      43114,  // Avalanche
      1301,   // Unichain
      // Testnets
      11155111, // Sepolia
      421614,   // Arbitrum Sepolia
      84532,    // Base Sepolia
    ];
    
    return supportedChains.includes(chainId);
  }
}

// Instance exportée du service
export const circlePaymasterService = new CirclePaymasterService(); 