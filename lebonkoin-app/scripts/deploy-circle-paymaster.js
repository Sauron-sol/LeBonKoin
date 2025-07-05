const { ethers } = require("hardhat");
const fs = require("fs");

// Configuration des testnets supportés
const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
  },
  arbitrumSepolia: {
    chainId: 421614,
    name: "Arbitrum Sepolia", 
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
  },
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  },
  optimismSepolia: {
    chainId: 11155420,
    name: "Optimism Sepolia",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    usdc: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7"
  },
  polygonAmoy: {
    chainId: 80002,
    name: "Polygon Amoy",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    usdc: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
  }
};

async function deployCirclePaymaster(networkName) {
  const network = NETWORKS[networkName];
  if (!network) {
    throw new Error(`Réseau non supporté: ${networkName}`);
  }

  console.log(`\n🚀 Déploiement Circle Paymaster sur ${network.name}...`);
  
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Adresse déployeur: ${deployer.address}`);
  
  // Vérifier le solde
  const balance = await deployer.getBalance();
  console.log(`💰 Solde: ${ethers.utils.formatEther(balance)} ETH`);
  
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    throw new Error("Solde insuffisant pour le déploiement");
  }

  // Déployer le contrat
  const CirclePaymaster = await ethers.getContractFactory("CirclePaymaster");
  const circlePaymaster = await CirclePaymaster.deploy(
    network.entryPoint,
    network.usdc,
    deployer.address
  );

  await circlePaymaster.deployed();
  
  console.log(`✅ Circle Paymaster déployé: ${circlePaymaster.address}`);
  console.log(`🔗 EntryPoint: ${network.entryPoint}`);
  console.log(`💵 USDC: ${network.usdc}`);
  
  // Déposer de l'ETH pour sponsoriser les transactions
  const depositAmount = ethers.utils.parseEther("0.005"); // 0.005 ETH
  console.log(`\n💰 Dépôt de ${ethers.utils.formatEther(depositAmount)} ETH...`);
  
  const depositTx = await circlePaymaster.deposit({ value: depositAmount });
  await depositTx.wait();
  
  console.log(`✅ Dépôt effectué: ${depositTx.hash}`);
  
  // Vérifier le dépôt
  const deposit = await circlePaymaster.getDeposit();
  console.log(`💰 Dépôt EntryPoint: ${ethers.utils.formatEther(deposit)} ETH`);

  return {
    address: circlePaymaster.address,
    chainId: network.chainId,
    network: network.name,
    entryPoint: network.entryPoint,
    usdc: network.usdc,
    deposit: ethers.utils.formatEther(deposit)
  };
}

async function deployAll() {
  console.log("🎯 Déploiement Circle Paymaster sur tous les testnets...");
  
  const deployments = {};
  const networkName = process.env.HARDHAT_NETWORK || "sepolia";
  
  try {
    const result = await deployCirclePaymaster(networkName);
    deployments[networkName] = result;
    
    console.log(`\n✅ Déploiement terminé sur ${result.network}`);
    console.log(`📋 Résumé:`);
    console.log(`   - Adresse: ${result.address}`);
    console.log(`   - Chain ID: ${result.chainId}`);
    console.log(`   - Dépôt: ${result.deposit} ETH`);
    
  } catch (error) {
    console.error(`❌ Erreur déploiement ${networkName}:`, error.message);
    throw error;
  }
  
  // Sauvegarder les adresses déployées
  const deploymentsFile = "deployments.json";
  let existingDeployments = {};
  
  if (fs.existsSync(deploymentsFile)) {
    existingDeployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
  }
  
  const updatedDeployments = {
    ...existingDeployments,
    circlePaymaster: {
      ...existingDeployments.circlePaymaster,
      ...deployments
    },
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(deploymentsFile, JSON.stringify(updatedDeployments, null, 2));
  console.log(`\n💾 Adresses sauvegardées dans ${deploymentsFile}`);
  
  return deployments;
}

// Fonction pour générer le code TypeScript
function generateTypeScriptConfig(deployments) {
  const config = `// Configuration générée automatiquement
export const CIRCLE_PAYMASTER_ADDRESSES = {
${Object.entries(deployments).map(([network, data]) => 
  `  [${data.chainId}]: '${data.address}', // ${data.network}`
).join('\n')}
} as const;

export const CIRCLE_PAYMASTER_DEPLOYMENTS = {
${Object.entries(deployments).map(([network, data]) => 
  `  [${data.chainId}]: {
    address: '${data.address}',
    network: '${data.network}',
    entryPoint: '${data.entryPoint}',
    usdc: '${data.usdc}',
    deposit: '${data.deposit}'
  }`
).join(',\n')}
} as const;`;

  fs.writeFileSync("src/lib/paymaster-config.ts", config);
  console.log("📝 Configuration TypeScript générée: src/lib/paymaster-config.ts");
}

// Exécuter le déploiement si appelé directement
if (require.main === module) {
  deployAll()
    .then((deployments) => {
      if (Object.keys(deployments).length > 0) {
        generateTypeScriptConfig(deployments);
      }
      console.log("\n🎉 Déploiement Circle Paymaster terminé avec succès!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Erreur déploiement:", error);
      process.exit(1);
    });
}

module.exports = { deployCirclePaymaster, deployAll }; 