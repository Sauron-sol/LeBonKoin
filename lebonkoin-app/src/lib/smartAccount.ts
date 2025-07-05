import { 
  encodeFunctionData, 
  encodeAbiParameters,
  keccak256,
  getAddress,
  createPublicClient,
  createWalletClient,
  http,
  Address,
  PublicClient,
  WalletClient,
  Chain
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { 
  SIMPLE_ACCOUNT_FACTORY_ADDRESSES,
  BUNDLER_ENDPOINTS,
  UserOperation,
  getBundlerService
} from './bundler'

// ABI du SimpleAccountFactory
export const SIMPLE_ACCOUNT_FACTORY_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'salt', type: 'uint256' }
    ],
    name: 'createAccount',
    outputs: [{ name: 'ret', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'salt', type: 'uint256' }
    ],
    name: 'getAddress',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

// ABI du SimpleAccount
export const SIMPLE_ACCOUNT_ABI = [
  {
    inputs: [
      { name: 'dest', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'func', type: 'bytes' }
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'targets', type: 'address[]' },
      { name: 'values', type: 'uint256[]' },
      { name: 'data', type: 'bytes[]' }
    ],
    name: 'executeBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getNonce',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

// ABI de l'EntryPoint pour getNonce
export const ENTRY_POINT_ABI = [
  {
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'key', type: 'uint192' }
    ],
    name: 'getNonce',
    outputs: [{ name: 'nonce', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export interface SmartAccountConfig {
  ownerPrivateKey: `0x${string}`
  salt: bigint
  chainId: number
  chain: Chain
}

export class SmartAccount {
  private owner: ReturnType<typeof privateKeyToAccount>
  private salt: bigint
  private chainId: number
  private chain: Chain
  private publicClient: PublicClient
  private walletClient: WalletClient
  private factoryAddress: Address
  private entryPointAddress: Address
  private bundlerService: ReturnType<typeof getBundlerService>

  constructor(config: SmartAccountConfig) {
    this.owner = privateKeyToAccount(config.ownerPrivateKey)
    this.salt = config.salt
    this.chainId = config.chainId
    this.chain = config.chain
    
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http()
    })
    
    this.walletClient = createWalletClient({
      chain: this.chain,
      transport: http(),
      account: this.owner
    })

    this.factoryAddress = SIMPLE_ACCOUNT_FACTORY_ADDRESSES[this.chainId as keyof typeof SIMPLE_ACCOUNT_FACTORY_ADDRESSES]
    
    const bundlerConfig = BUNDLER_ENDPOINTS[this.chainId as keyof typeof BUNDLER_ENDPOINTS]
    this.entryPointAddress = bundlerConfig.entryPoint as Address
    
    this.bundlerService = getBundlerService(this.chainId)
  }

  /**
   * Calcule l'adresse du smart account (sans le déployer)
   */
  async getAddress(): Promise<Address> {
    const address = await this.publicClient.readContract({
      address: this.factoryAddress,
      abi: SIMPLE_ACCOUNT_FACTORY_ABI,
      functionName: 'getAddress',
      args: [this.owner.address, this.salt]
    })

    return getAddress(address)
  }

  /**
   * Vérifie si le smart account est déjà déployé
   */
  async isDeployed(): Promise<boolean> {
    const address = await this.getAddress()
    const bytecode = await this.publicClient.getBytecode({ address })
    return !!bytecode && bytecode !== '0x'
  }

  /**
   * Génère l'initCode pour déployer le smart account
   */
  private async getInitCode(): Promise<`0x${string}`> {
    const isDeployed = await this.isDeployed()
    if (isDeployed) {
      return '0x' // Pas d'initCode si déjà déployé
    }

    const createAccountCallData = encodeFunctionData({
      abi: SIMPLE_ACCOUNT_FACTORY_ABI,
      functionName: 'createAccount',
      args: [this.owner.address, this.salt]
    })

    return `${this.factoryAddress}${createAccountCallData.slice(2)}` as `0x${string}`
  }

  /**
   * Récupère le nonce du smart account
   */
  async getNonce(): Promise<bigint> {
    const smartAccountAddress = await this.getAddress()
    
    try {
      const nonce = await this.publicClient.readContract({
        address: this.entryPointAddress,
        abi: ENTRY_POINT_ABI,
        functionName: 'getNonce',
        args: [smartAccountAddress, BigInt(0)] // key = 0 pour le nonce par défaut
      })
      return nonce
    } catch {
      // Si le smart account n'est pas encore déployé, le nonce est 0
      return BigInt(0)
    }
  }

  /**
   * Crée le callData pour une transaction
   */
  private createCallData(to: Address, value: bigint, data: `0x${string}`): `0x${string}` {
    return encodeFunctionData({
      abi: SIMPLE_ACCOUNT_ABI,
      functionName: 'execute',
      args: [to, value, data]
    })
  }

  /**
   * Crée une UserOperation pour un paiement USDC gasless
   */
  async createUserOperation(params: {
    to: Address
    value?: bigint
    data?: `0x${string}`
    paymasterAndData?: `0x${string}`
  }): Promise<UserOperation> {
    const { to, value = BigInt(0), data = '0x', paymasterAndData = '0x' } = params

    const [smartAccountAddress, nonce, initCode] = await Promise.all([
      this.getAddress(),
      this.getNonce(),
      this.getInitCode()
    ])

    const callData = this.createCallData(to, value, data)

    // UserOperation partielle pour estimation
    const partialUserOp = {
      sender: smartAccountAddress,
      nonce,
      initCode,
      callData,
      paymasterAndData,
      signature: '0x' as `0x${string}`
    }

    // Estimation des gas
    const gasEstimation = await this.bundlerService.estimateUserOperationGas(partialUserOp)

    // Récupération des gas prices
    const feeData = await this.publicClient.estimateFeesPerGas()

    const userOp: UserOperation = {
      ...partialUserOp,
      callGasLimit: gasEstimation.callGasLimit,
      verificationGasLimit: gasEstimation.verificationGasLimit,
      preVerificationGas: gasEstimation.preVerificationGas,
      maxFeePerGas: feeData.maxFeePerGas || BigInt(0),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigInt(0),
      signature: await this.signUserOperation({
        ...partialUserOp,
        callGasLimit: gasEstimation.callGasLimit,
        verificationGasLimit: gasEstimation.verificationGasLimit,
        preVerificationGas: gasEstimation.preVerificationGas,
        maxFeePerGas: feeData.maxFeePerGas || BigInt(0),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigInt(0),
      })
    }

    return userOp
  }

  /**
   * Signe une UserOperation
   */
  private async signUserOperation(userOp: Omit<UserOperation, 'signature'>): Promise<`0x${string}`> {
    // Hash de la UserOperation selon EIP-4337
    const userOpHash = this.getUserOperationHash(userOp)
    
    // Signature ECDSA
    const signature = await this.owner.signMessage({
      message: { raw: userOpHash }
    })

    return signature
  }

  /**
   * Calcule le hash de la UserOperation selon EIP-4337
   */
  private getUserOperationHash(userOp: Omit<UserOperation, 'signature'>): `0x${string}` {
    const packedUserOp = encodeAbiParameters(
      [
        { name: 'sender', type: 'address' },
        { name: 'nonce', type: 'uint256' }, 
        { name: 'initCodeHash', type: 'bytes32' },
        { name: 'callDataHash', type: 'bytes32' },
        { name: 'callGasLimit', type: 'uint256' },
        { name: 'verificationGasLimit', type: 'uint256' },
        { name: 'preVerificationGas', type: 'uint256' },
        { name: 'maxFeePerGas', type: 'uint256' },
        { name: 'maxPriorityFeePerGas', type: 'uint256' },
        { name: 'paymasterAndDataHash', type: 'bytes32' },
      ],
      [
        userOp.sender,
        userOp.nonce,
        keccak256(userOp.initCode),
        keccak256(userOp.callData),
        userOp.callGasLimit,
        userOp.verificationGasLimit,
        userOp.preVerificationGas,
        userOp.maxFeePerGas,
        userOp.maxPriorityFeePerGas,
        keccak256(userOp.paymasterAndData),
      ]
    )

    const encoded = encodeAbiParameters(
      [
        { name: 'hash', type: 'bytes32' },
        { name: 'entryPoint', type: 'address' },
        { name: 'chainId', type: 'uint256' }
      ],
      [keccak256(packedUserOp), this.entryPointAddress, BigInt(this.chainId)]
    )

    return keccak256(encoded)
  }

  /**
   * Envoie une UserOperation via le bundler
   */
  async sendUserOperation(userOp: UserOperation): Promise<`0x${string}`> {
    return this.bundlerService.sendUserOperation(userOp)
  }

  /**
   * Attend la confirmation d'une UserOperation
   */
  async waitForUserOperationReceipt(userOpHash: `0x${string}`, maxWait = 60000): Promise<any> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWait) {
      try {
        const receipt = await this.bundlerService.getUserOperationReceipt(userOpHash)
        if (receipt) {
          return receipt
        }
      } catch {
        // Continuer à attendre
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    throw new Error('Timeout: UserOperation non confirmée')
  }
}

/**
 * Crée une instance SmartAccount
 */
export function createSmartAccount(config: SmartAccountConfig): SmartAccount {
  return new SmartAccount(config)
} 