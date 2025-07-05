import { createPublicClient, http, getContract, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import 'dotenv/config';

// Adresses USDC sur Ethereum Sepolia
const SEPOLIA_USDC = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// ABI minimal pour USDC
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
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
];

// Client pour Ethereum Sepolia
const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

async function checkUSDCBalance(walletAddress) {
  try {
    console.log(`🔍 Vérification du solde USDC pour: ${walletAddress}`);
    console.log(`📍 Réseau: Ethereum Sepolia`);
    console.log(`🪙 Contrat USDC: ${SEPOLIA_USDC}`);
    console.log('─'.repeat(60));

    const usdcContract = getContract({
      address: SEPOLIA_USDC,
      abi: USDC_ABI,
      client,
    });

    // Récupérer les infos du token
    const [balance, symbol, decimals] = await Promise.all([
      usdcContract.read.balanceOf([walletAddress]),
      usdcContract.read.symbol(),
      usdcContract.read.decimals(),
    ]);

    const formattedBalance = formatUnits(balance, decimals);

    console.log(`💰 Solde USDC: ${formattedBalance} ${symbol}`);
    console.log(`🔢 Solde brut: ${balance.toString()}`);
    console.log(`📊 Décimales: ${decimals}`);

    if (balance === 0n) {
      console.log('\n🚨 AUCUN USDC TROUVÉ !');
      console.log('\n📋 Comment obtenir des USDC testnet:');
      console.log('1. 🌐 Visitez: https://faucet.circle.com');
      console.log('2. 🔗 Connectez votre wallet MetaMask');
      console.log('3. 🌍 Sélectionnez "Ethereum Sepolia"');
      console.log('4. 💧 Demandez 10 USDC gratuits (1x par heure)');
      console.log('5. ⏱️  Attendez ~1-2 minutes pour la confirmation');
      console.log('\n🔄 Puis relancez ce script pour vérifier');
    } else {
      console.log('\n✅ USDC trouvés ! Vous pouvez tester le Circle Paymaster');
    }

    return { balance, formattedBalance, symbol, decimals };
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return null;
  }
}

async function main() {
  console.log('🎯 VÉRIFICATION USDC SEPOLIA - CIRCLE PAYMASTER');
  console.log('═'.repeat(60));

  // Wallet de test défini dans .env
  const testWallet = process.env.TEST_WALLET_ADDRESS || '0x0813c67B88F1DC95a6e684Cf3BAf4b9A423A9Eb7';
  
  await checkUSDCBalance(testWallet);

  console.log('\n' + '═'.repeat(60));
  console.log('📚 INFORMATIONS UTILES:');
  console.log('• Circle Faucet: https://faucet.circle.com');
  console.log('• Sepolia Explorer: https://sepolia.etherscan.io');
  console.log('• Circle Paymaster Doc: https://developers.circle.com/stablecoins/quickstart-circle-paymaster');
  console.log('• Contrat USDC Sepolia: ' + SEPOLIA_USDC);
  console.log('\n🚀 Prêt pour tester le paiement gasless avec Circle Paymaster !');
}

// Exécuter le script
main().catch(console.error); 