#!/usr/bin/env node

// Script pour vérifier les soldes USDC testnet
// Usage: node scripts/check-balances.js [wallet-address]

import { createPublicClient, http } from 'viem';
import { sepolia, baseSepolia, arbitrumSepolia, avalancheFuji, lineaSepolia } from 'viem/chains';

// Adresses USDC testnet
const USDC_ADDRESSES = {
  [sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  [avalancheFuji.id]: '0x5425890298aed601595a70AB815c96711a31Bc65',
  [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  [arbitrumSepolia.id]: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  [lineaSepolia.id]: '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7'
};

// Mapping des chaînes
const CHAINS = {
  [sepolia.id]: { name: 'Ethereum Sepolia', chain: sepolia },
  [avalancheFuji.id]: { name: 'Avalanche Fuji', chain: avalancheFuji },
  [baseSepolia.id]: { name: 'Base Sepolia', chain: baseSepolia },
  [arbitrumSepolia.id]: { name: 'Arbitrum Sepolia', chain: arbitrumSepolia },
  [lineaSepolia.id]: { name: 'Linea Sepolia', chain: lineaSepolia }
};

// ABI pour balanceOf
const USDC_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

async function checkBalance(chainId, walletAddress) {
  const { name, chain } = CHAINS[chainId];
  const usdcAddress = USDC_ADDRESSES[chainId];
  
  const client = createPublicClient({
    chain,
    transport: http()
  });

  try {
    const balance = await client.readContract({
      address: usdcAddress,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [walletAddress]
    });

    const formattedBalance = (Number(balance) / 1e6).toFixed(2);
    return { name, balance: formattedBalance, success: true };
  } catch (error) {
    return { name, balance: '0.00', success: false, error: error.message };
  }
}

async function main() {
  const walletAddress = process.argv[2] || '0x0813c67B88F1DC95a6e684Cf3BAf4b9A423A9Eb7';
  
  console.log('🔍 Vérification des soldes USDC testnet...');
  console.log(`📄 Wallet: ${walletAddress}\n`);

  const results = [];
  
  for (const chainId of Object.keys(CHAINS)) {
    const result = await checkBalance(Number(chainId), walletAddress);
    results.push(result);
    
    const status = result.success ? '✅' : '❌';
    const balance = result.success ? `${result.balance} USDC` : 'Erreur';
    
    console.log(`${status} ${result.name.padEnd(20)} ${balance}`);
    if (!result.success) {
      console.log(`   ⚠️  ${result.error.slice(0, 60)}...`);
    }
  }

  const totalBalance = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + parseFloat(r.balance), 0);

  console.log('\n' + '='.repeat(50));
  console.log(`💰 Total USDC: ${totalBalance.toFixed(2)} USDC`);
  
  if (totalBalance === 0) {
    console.log('\n🎯 Pour obtenir des USDC testnet:');
    console.log('   Circle Faucet: https://faucet.circle.com');
    console.log('   Limite: 10 USDC par heure par réseau');
  } else {
    console.log('\n✅ Prêt pour tester les transferts CCTP!');
  }
}

main().catch(console.error); 