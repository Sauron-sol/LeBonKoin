import { Address } from "viem";

// Types ERC-7730 pour Clear Signing
export interface ERC7730Descriptor {
  context: {
    contract: Address;
    contractName: string;
    website: string;
    description: string;
  };
  metadata: {
    owner: string;
    legal: {
      terms: string;
      privacy: string;
    };
    lastUpdate: string;
  };
  display: {
    [selector: string]: {
      intent: string;
      fields: Array<{
        path: string;
        label: string;
        format?: string;
        description?: string;
      }>;
    };
  };
}

// Descripteur ERC-7730 pour le contrat d'escrow LeBonKoin
export const LEBONKOIN_ESCROW_DESCRIPTOR: ERC7730Descriptor = {
  context: {
    contract: "0x0000000000000000000000000000000000000000" as Address, // À remplacer par l'adresse réelle
    contractName: "LeBonKoinEscrow",
    website: "https://lebonkoin.world",
    description: "Contrat d'escrow sécurisé pour la marketplace LeBonKoin",
  },
  metadata: {
    owner: "LeBonKoin Team",
    legal: {
      terms: "https://lebonkoin.world/terms",
      privacy: "https://lebonkoin.world/privacy",
    },
    lastUpdate: new Date().toISOString(),
  },
  display: {
    // Fonction createListing
    "0x12345678": {
      intent: "Créer une annonce sur LeBonKoin",
      fields: [
        {
          path: "title",
          label: "Titre de l'annonce",
          description: "Le titre de votre objet à vendre",
        },
        {
          path: "price",
          label: "Prix en USDC",
          format: "currency",
          description: "Prix de vente en USDC",
        },
        {
          path: "description",
          label: "Description",
          description: "Description détaillée de l'objet",
        },
      ],
    },
    // Fonction purchaseItem
    "0x87654321": {
      intent: "Acheter un objet sur LeBonKoin",
      fields: [
        {
          path: "listingId",
          label: "ID de l'annonce",
          description: "Identifiant unique de l'annonce",
        },
        {
          path: "amount",
          label: "Montant à payer",
          format: "currency",
          description: "Montant total en USDC (prix + frais)",
        },
        {
          path: "seller",
          label: "Vendeur",
          format: "address",
          description: "Adresse du vendeur",
        },
      ],
    },
    // Fonction confirmDelivery
    "0x11223344": {
      intent: "Confirmer la réception de l'objet",
      fields: [
        {
          path: "listingId",
          label: "ID de l'annonce",
          description: "Identifiant de l'annonce achetée",
        },
        {
          path: "rating",
          label: "Note du vendeur",
          description: "Note de 1 à 5 étoiles",
        },
      ],
    },
    // Fonction releaseFunds
    "0x55667788": {
      intent: "Libérer les fonds bloqués",
      fields: [
        {
          path: "listingId",
          label: "ID de l'annonce",
          description: "Identifiant de l'annonce",
        },
        {
          path: "amount",
          label: "Montant à libérer",
          format: "currency",
          description: "Montant en USDC à transférer au vendeur",
        },
      ],
    },
  },
};

// Descripteur ERC-7730 pour les paiements CCTP V2
export const CCTP_V2_DESCRIPTOR: ERC7730Descriptor = {
  context: {
    contract: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" as Address, // TokenMessengerV2
    contractName: "TokenMessengerV2",
    website: "https://developers.circle.com/stablecoins/cctp-getting-started",
    description: "Transfert USDC cross-chain via CCTP V2",
  },
  metadata: {
    owner: "Circle Internet Financial",
    legal: {
      terms: "https://www.circle.com/legal/terms-of-service",
      privacy: "https://www.circle.com/legal/privacy-policy",
    },
    lastUpdate: new Date().toISOString(),
  },
  display: {
    // Fonction depositForBurn
    "0xf856ddb6": {
      intent: "Envoyer USDC vers une autre blockchain",
      fields: [
        {
          path: "amount",
          label: "Montant USDC",
          format: "currency",
          description: "Montant à envoyer en USDC",
        },
        {
          path: "destinationDomain",
          label: "Blockchain de destination",
          description: "Chaîne où recevoir les USDC",
        },
        {
          path: "mintRecipient",
          label: "Adresse de réception",
          format: "address",
          description: "Adresse qui recevra les USDC",
        },
        {
          path: "maxFee",
          label: "Frais maximum",
          format: "currency",
          description: "Frais maximum acceptés pour le transfert",
        },
      ],
    },
    // Fonction depositForBurnWithHook
    "0x12345abc": {
      intent: "Envoyer USDC avec action automatique",
      fields: [
        {
          path: "amount",
          label: "Montant USDC",
          format: "currency",
          description: "Montant à envoyer en USDC",
        },
        {
          path: "destinationDomain",
          label: "Blockchain de destination",
          description: "Chaîne où recevoir les USDC",
        },
        {
          path: "mintRecipient",
          label: "Contrat de réception",
          format: "address",
          description: "Contrat qui recevra les USDC",
        },
        {
          path: "hookData",
          label: "Données d'action",
          description: "Données pour déclencher l'action automatique",
        },
      ],
    },
  },
};

// Utilitaires pour générer les métadonnées ERC-7730
export function generateERC7730Metadata(
  contractAddress: Address,
  functionSelector: string,
  params: Record<string, any>
): string {
  const descriptor = contractAddress.toLowerCase().includes("escrow") 
    ? LEBONKOIN_ESCROW_DESCRIPTOR 
    : CCTP_V2_DESCRIPTOR;

  const displayInfo = descriptor.display[functionSelector];
  if (!displayInfo) {
    throw new Error(`Fonction ${functionSelector} non trouvée dans le descripteur ERC-7730`);
  }

  const metadata = {
    intent: displayInfo.intent,
    fields: displayInfo.fields.map(field => ({
      label: field.label,
      value: params[field.path],
      format: field.format,
      description: field.description,
    })),
    contract: {
      name: descriptor.context.contractName,
      address: contractAddress,
      website: descriptor.context.website,
    },
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(metadata, null, 2);
}

// Validation des descripteurs ERC-7730
export function validateERC7730Descriptor(descriptor: ERC7730Descriptor): boolean {
  try {
    // Vérifier la structure de base
    if (!descriptor.context || !descriptor.metadata || !descriptor.display) {
      return false;
    }

    // Vérifier les champs obligatoires
    const requiredContextFields = ["contract", "contractName", "website", "description"];
    const requiredMetadataFields = ["owner", "legal", "lastUpdate"];

    for (const field of requiredContextFields) {
      if (!(field in descriptor.context)) return false;
    }

    for (const field of requiredMetadataFields) {
      if (!(field in descriptor.metadata)) return false;
    }

    // Vérifier que chaque fonction a un intent et des fields
    for (const [selector, displayInfo] of Object.entries(descriptor.display)) {
      if (!displayInfo.intent || !Array.isArray(displayInfo.fields)) {
        return false;
      }

      // Vérifier que chaque field a un path et un label
      for (const field of displayInfo.fields) {
        if (!field.path || !field.label) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de la validation ERC-7730:", error);
    return false;
  }
}

// Fonction pour formater les valeurs selon le type
export function formatERC7730Value(value: any, format?: string): string {
  if (!format) return String(value);

  switch (format) {
    case "currency":
      return `${Number(value) / 1e6} USDC`; // Conversion depuis wei USDC (6 décimales)
    case "address":
      return `${String(value).slice(0, 6)}...${String(value).slice(-4)}`;
    case "timestamp":
      return new Date(Number(value) * 1000).toLocaleString("fr-FR");
    default:
      return String(value);
  }
}

// ERC-7730 Clear Signing Implementation pour LeBonKoin
// Standard pour la signature transparente sur Ledger et autres wallets

export interface ERC7730Context {
  contract: {
    name: string;
    deployments: {
      [chainId: number]: {
        address: string;
        contractName: string;
      };
    };
  };
  metadata: {
    $schema: string;
    context: ERC7730Context;
    metadata: {
      displayName: string;
      description: string;
      author: string;
      version: string;
    };
  };
  display?: {
    [key: string]: ERC7730DisplayDefinition;
  };
}

export interface ERC7730DisplayDefinition {
  intent: string;
  fields: {
    [key: string]: ERC7730FieldDefinition;
  };
}

export interface ERC7730FieldDefinition {
  label: string;
  format?: 'token_amount' | 'address' | 'raw' | 'date' | 'percentage';
  params?: {
    tokenPath?: string;
    decimals?: number;
    threshold?: string;
  };
}

// Métadonnées ERC-7730 pour les contrats CCTP
export const CCTP_ERC7730_METADATA = {
  "$schema": "https://schemas.ledger.com/erc7730/1.0.0/erc7730.json",
  "context": {
    "contract": {
      "name": "CCTP TokenMessenger",
      "deployments": {
        "1": {
          "address": "0xBd3fa81B58Ba92a82136038B25aDec7066af3155",
          "contractName": "TokenMessenger"
        },
        "43114": {
          "address": "0x6B25532e1060CE10cc3B0A99e5683b91BFDe6982", 
          "contractName": "TokenMessenger"
        },
        "8453": {
          "address": "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962",
          "contractName": "TokenMessenger"
        },
        "42161": {
          "address": "0x19330d10D9Cc8751218eaf51E8885D058642E08A",
          "contractName": "TokenMessenger"
        },
        "59144": {
          "address": "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
          "contractName": "TokenMessenger"
        }
      }
    }
  },
  "metadata": {
    "displayName": "LeBonKoin - Paiement USDC Cross-Chain",
    "description": "Système de paiement sécurisé utilisant CCTP V2 pour les achats sur LeBonKoin",
    "author": "LeBonKoin Team",
    "version": "1.0.0"
  },
  "display": {
    "depositForBurn": {
      "intent": "🛒 Acheter sur LeBonKoin via CCTP",
      "fields": {
        "amount": {
          "label": "Montant à payer",
          "format": "token_amount",
          "params": {
            "tokenPath": "$.burnToken",
            "decimals": 6
          }
        },
        "destinationDomain": {
          "label": "Chaîne de destination",
          "format": "raw"
        },
        "mintRecipient": {
          "label": "Vendeur",
          "format": "address"
        },
        "burnToken": {
          "label": "Token",
          "format": "address"
        }
      }
    }
  }
} as const;

// Métadonnées ERC-7730 pour les contrats marketplace LeBonKoin
export const LEBONKOIN_ERC7730_METADATA = {
  "$schema": "https://schemas.ledger.com/erc7730/1.0.0/erc7730.json",
  "context": {
    "contract": {
      "name": "LeBonKoin Marketplace",
      "deployments": {
        "1": {
          "address": "0x0000000000000000000000000000000000000000", // À définir
          "contractName": "LeBonKoinMarketplace"
        },
        "8453": {
          "address": "0x0000000000000000000000000000000000000000", // À définir
          "contractName": "LeBonKoinMarketplace"
        },
        "42161": {
          "address": "0x0000000000000000000000000000000000000000", // À définir
          "contractName": "LeBonKoinMarketplace"
        }
      }
    }
  },
  "metadata": {
    "displayName": "LeBonKoin - Marketplace Décentralisée",
    "description": "Achat sécurisé d'articles sur la marketplace décentralisée LeBonKoin",
    "author": "LeBonKoin Team",
    "version": "1.0.0"
  },
  "display": {
    "buyItem": {
      "intent": "🛒 Acheter un article",
      "fields": {
        "itemId": {
          "label": "ID de l'article",
          "format": "raw"
        },
        "price": {
          "label": "Prix",
          "format": "token_amount",
          "params": {
            "decimals": 6
          }
        },
        "seller": {
          "label": "Vendeur",
          "format": "address"
        }
      }
    },
    "makeOffer": {
      "intent": "💰 Faire une offre",
      "fields": {
        "itemId": {
          "label": "ID de l'article",
          "format": "raw"
        },
        "offerAmount": {
          "label": "Montant de l'offre",
          "format": "token_amount",
          "params": {
            "decimals": 6
          }
        },
        "expirationTime": {
          "label": "Expiration",
          "format": "date"
        }
      }
    },
    "acceptOffer": {
      "intent": "✅ Accepter une offre",
      "fields": {
        "itemId": {
          "label": "ID de l'article",
          "format": "raw"
        },
        "offerId": {
          "label": "ID de l'offre",
          "format": "raw"
        },
        "buyer": {
          "label": "Acheteur",
          "format": "address"
        },
        "amount": {
          "label": "Montant",
          "format": "token_amount",
          "params": {
            "decimals": 6
          }
        }
      }
    }
  }
} as const;

// Service ERC-7730 pour générer des descriptions claires
export class ERC7730Service {
  private chainNames: { [key: number]: string } = {
    1: 'Ethereum',
    11155111: 'Ethereum Sepolia',
    43114: 'Avalanche',
    43113: 'Avalanche Fuji',
    8453: 'Base',
    84532: 'Base Sepolia', 
    42161: 'Arbitrum',
    421614: 'Arbitrum Sepolia',
    59144: 'Linea',
    59141: 'Linea Sepolia'
  };

  private domainToChain: { [key: number]: string } = {
    0: 'Ethereum Sepolia',
    1: 'Avalanche Fuji',
    2: 'OP Sepolia', 
    3: 'Arbitrum Sepolia',
    6: 'Base Sepolia',
    7: 'Polygon Amoy',
    9: 'Linea Sepolia'
  };

  // Générer une description claire pour une transaction CCTP
  public generateCCTPDescription(
    functionName: string,
    params: any,
    chainId: number
  ): {
    title: string;
    description: string;
    details: Array<{ label: string; value: string; type: 'amount' | 'address' | 'text' }>;
    risks: string[];
  } {
    switch (functionName) {
      case 'depositForBurn':
        return this.describeCCTPTransfer(params, chainId);
      
      case 'receiveMessage':
        return this.describeCCTPReceive(params, chainId);
        
      case 'approve':
        return this.describeUSDCApproval(params, chainId);
        
      default:
        return {
          title: '⚠️ Transaction inconnue',
          description: 'Cette transaction n\'est pas reconnue par LeBonKoin',
          details: [],
          risks: ['Transaction non vérifiée', 'Fonction inconnue']
        };
    }
  }

  // Décrire un transfert CCTP
  private describeCCTPTransfer(params: any, fromChainId: number): {
    title: string;
    description: string;
    details: Array<{ label: string; value: string; type: 'amount' | 'address' | 'text' }>;
    risks: string[];
  } {
    const { amount, destinationDomain, mintRecipient } = params;
    const toChainName = this.getChainNameByDomain(destinationDomain);
    const fromChainName = this.chainNames[fromChainId] || 'Chaîne inconnue';
    
    // Convertir le montant (USDC a 6 décimales)
    const usdcAmount = (parseInt(amount) / 1e6).toFixed(2);
    
    // Convertir bytes32 en adresse
    const recipientAddress = '0x' + mintRecipient.slice(-40);

    return {
      title: '🔄 Transfert USDC Cross-Chain',
      description: `Transfert de ${usdcAmount} USDC de ${fromChainName} vers ${toChainName}`,
      details: [
        {
          label: 'Montant',
          value: `${usdcAmount} USDC`,
          type: 'amount'
        },
        {
          label: 'De',
          value: fromChainName,
          type: 'text'
        },
        {
          label: 'Vers',
          value: toChainName,
          type: 'text'
        },
        {
          label: 'Destinataire',
          value: recipientAddress,
          type: 'address'
        }
      ],
      risks: [
        'Les transferts cross-chain peuvent prendre plusieurs minutes',
        'Vérifiez que l\'adresse du destinataire est correcte',
        'Les frais de gas seront prélevés sur votre solde'
      ]
    };
  }

  // Décrire la réception d'un message CCTP
  private describeCCTPReceive(params: any, toChainId: number): {
    title: string;
    description: string;
    details: Array<{ label: string; value: string; type: 'amount' | 'address' | 'text' }>;
    risks: string[];
  } {
    const toChainName = this.chainNames[toChainId] || 'Chaîne inconnue';

    return {
      title: '✅ Réception USDC Cross-Chain',
      description: `Finalisation de la réception d'USDC sur ${toChainName}`,
      details: [
        {
          label: 'Action',
          value: 'Finaliser le transfert',
          type: 'text'
        },
        {
          label: 'Chaîne',
          value: toChainName,
          type: 'text'
        }
      ],
      risks: [
        'Cette transaction finalise votre transfert USDC',
        'Les USDC seront crédités sur votre wallet après confirmation'
      ]
    };
  }

  // Décrire une approbation USDC
  private describeUSDCApproval(params: any, chainId: number): {
    title: string;
    description: string;
    details: Array<{ label: string; value: string; type: 'amount' | 'address' | 'text' }>;
    risks: string[];
  } {
    const { spender, amount } = params;
    const chainName = this.chainNames[chainId] || 'Chaîne inconnue';
    
    // Convertir le montant (USDC a 6 décimales)
    const usdcAmount = (parseInt(amount) / 1e6).toFixed(2);

    return {
      title: '✅ Autorisation USDC',
      description: `Autorisation de dépense de ${usdcAmount} USDC sur ${chainName}`,
      details: [
        {
          label: 'Montant autorisé',
          value: `${usdcAmount} USDC`,
          type: 'amount'
        },
        {
          label: 'Contrat autorisé',
          value: spender,
          type: 'address'
        },
        {
          label: 'Chaîne',
          value: chainName,
          type: 'text'
        }
      ],
      risks: [
        'Ce contrat pourra dépenser vos USDC jusqu\'à ce montant',
        'Vérifiez que l\'adresse du contrat est correcte',
        'Cette autorisation est nécessaire pour le transfert CCTP'
      ]
    };
  }

  // Générer une description pour une transaction marketplace
  public generateMarketplaceDescription(
    functionName: string,
    params: any,
    itemData?: any
  ): {
    title: string;
    description: string;
    details: Array<{ label: string; value: string; type: 'amount' | 'address' | 'text' }>;
    risks: string[];
  } {
    switch (functionName) {
      case 'buyItem':
        return this.describeItemPurchase(params, itemData);
        
      case 'makeOffer':
        return this.describeOffer(params, itemData);
        
      case 'acceptOffer':
        return this.describeOfferAcceptance(params, itemData);
        
      default:
        return {
          title: '⚠️ Transaction marketplace inconnue',
          description: 'Cette transaction n\'est pas reconnue',
          details: [],
          risks: ['Transaction non vérifiée']
        };
    }
  }

  // Décrire un achat d'article
  private describeItemPurchase(params: any, itemData?: any): {
    title: string;
    description: string;
    details: Array<{ label: string; value: string; type: 'amount' | 'address' | 'text' }>;
    risks: string[];
  } {
    const { itemId, price, seller } = params;
    const usdcPrice = (parseInt(price) / 1e6).toFixed(2);
    
    return {
      title: '🛒 Achat sur LeBonKoin',
      description: itemData?.title 
        ? `Achat de "${itemData.title}" pour ${usdcPrice} USDC`
        : `Achat de l'article #${itemId} pour ${usdcPrice} USDC`,
      details: [
        {
          label: 'Article',
          value: itemData?.title || `Article #${itemId}`,
          type: 'text'
        },
        {
          label: 'Prix',
          value: `${usdcPrice} USDC`,
          type: 'amount'
        },
        {
          label: 'Vendeur',
          value: seller,
          type: 'address'
        },
        ...(itemData?.category ? [{
          label: 'Catégorie',
          value: itemData.category,
          type: 'text' as const
        }] : [])
      ],
      risks: [
        'Vérifiez les détails de l\'article avant l\'achat',
        'Le paiement sera transféré directement au vendeur',
        'Assurez-vous que le vendeur est de confiance'
      ]
    };
  }

  // Décrire une offre
  private describeOffer(params: any, itemData?: any): {
    title: string;
    description: string;
    details: Array<{ label: string; value: string; type: 'amount' | 'address' | 'text' }>;
    risks: string[];
  } {
    const { itemId, offerAmount, expirationTime } = params;
    const usdcAmount = (parseInt(offerAmount) / 1e6).toFixed(2);
    const expirationDate = new Date(parseInt(expirationTime) * 1000).toLocaleDateString();
    
    return {
      title: '💰 Offre sur LeBonKoin',
      description: itemData?.title 
        ? `Offre de ${usdcAmount} USDC pour "${itemData.title}"`
        : `Offre de ${usdcAmount} USDC pour l'article #${itemId}`,
      details: [
        {
          label: 'Article',
          value: itemData?.title || `Article #${itemId}`,
          type: 'text'
        },
        {
          label: 'Montant de l\'offre',
          value: `${usdcAmount} USDC`,
          type: 'amount'
        },
        {
          label: 'Expiration',
          value: expirationDate,
          type: 'text'
        }
      ],
      risks: [
        'Votre offre sera visible par le vendeur',
        'Les fonds seront bloqués jusqu\'à expiration ou acceptation',
        'L\'offre peut être acceptée à tout moment avant expiration'
      ]
    };
  }

  // Décrire l'acceptation d'une offre
  private describeOfferAcceptance(params: any, itemData?: any): {
    title: string;
    description: string;
    details: Array<{ label: string; value: string; type: 'amount' | 'address' | 'text' }>;
    risks: string[];
  } {
    const { itemId, offerId, buyer, amount } = params;
    const usdcAmount = (parseInt(amount) / 1e6).toFixed(2);
    
    return {
      title: '✅ Acceptation d\'offre',
      description: itemData?.title 
        ? `Acceptation de l'offre de ${usdcAmount} USDC pour "${itemData.title}"`
        : `Acceptation de l'offre #${offerId} de ${usdcAmount} USDC`,
      details: [
        {
          label: 'Article',
          value: itemData?.title || `Article #${itemId}`,
          type: 'text'
        },
        {
          label: 'Montant',
          value: `${usdcAmount} USDC`,
          type: 'amount'
        },
        {
          label: 'Acheteur',
          value: buyer,
          type: 'address'
        }
      ],
      risks: [
        'En acceptant, vous vous engagez à vendre l\'article',
        'Le paiement sera transféré immédiatement',
        'Assurez-vous de pouvoir livrer l\'article'
      ]
    };
  }

  // Obtenir le nom de la chaîne par domaine CCTP
  private getChainNameByDomain(domain: number): string {
    return this.domainToChain[domain] || `Domaine ${domain}`;
  }

  // Générer le JSON ERC-7730 complet pour un contrat
  public generateERC7730JSON(contractAddress: string, chainId: number, contractType: 'cctp' | 'marketplace') {
    const baseMetadata = contractType === 'cctp' ? CCTP_ERC7730_METADATA : LEBONKOIN_ERC7730_METADATA;
    
    return {
      ...baseMetadata,
      context: {
        ...baseMetadata.context,
        contract: {
          ...baseMetadata.context.contract,
          deployments: {
            [chainId]: {
              address: contractAddress,
              contractName: (baseMetadata.context.contract.deployments as any)[chainId]?.contractName || 'Contract'
            }
          }
        }
      }
    };
  }
}

// Instance singleton
export const erc7730Service = new ERC7730Service(); 