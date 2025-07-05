import { Address } from 'viem';

// Types ERC-7730 officiels selon le standard
export interface ERC7730Schema {
  $schema: string;
  context: ERC7730Context;
  metadata: ERC7730Metadata;
  display: ERC7730Display;
}

export interface ERC7730Context {
  contract: {
    abi: Array<any>;
    deployments: Array<{
      chainId: number;
      address: string;
    }>;
  };
}

export interface ERC7730Metadata {
  title: string;
  description: string;
  domain: string;
  tags: string[];
  website?: string;
}

export interface ERC7730Display {
  definitions: {
    [functionName: string]: ERC7730FunctionDisplay;
  };
}

export interface ERC7730FunctionDisplay {
  format: 'transaction' | 'message';
  intent: string;
  description: string;
  fields: Array<ERC7730Field>;
  required: string[];
  risks: Array<ERC7730Risk>;
}

export interface ERC7730Field {
  path: string;
  label: string;
  format: string;
  params?: any;
}

export interface ERC7730Risk {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

/**
 * Registry ERC-7730 pour LeBonKoin
 * Charge et valide les métadonnées Clear Signing
 */
export class ERC7730Registry {
  private schemas: Map<string, ERC7730Schema> = new Map();
  private baseUrl: string;

  constructor(baseUrl: string = '/erc7730') {
    this.baseUrl = baseUrl;
  }

  /**
   * Charge un schéma ERC-7730 depuis un fichier JSON
   */
  async loadSchema(contractType: string): Promise<ERC7730Schema | null> {
    try {
      const response = await fetch(`${this.baseUrl}/lebonkoin-${contractType}.json`);
      if (!response.ok) {
        console.warn(`❌ Schéma ERC-7730 non trouvé: ${contractType}`);
        return null;
      }
      
      const schema: ERC7730Schema = await response.json();
      
      // Validation basique du schéma
      if (!this.validateSchema(schema)) {
        console.error(`❌ Schéma ERC-7730 invalide: ${contractType}`);
        return null;
      }
      
      this.schemas.set(contractType, schema);
      console.log(`✅ Schéma ERC-7730 chargé: ${contractType}`);
      return schema;
      
    } catch (error) {
      console.error(`❌ Erreur lors du chargement du schéma ${contractType}:`, error);
      return null;
    }
  }

  /**
   * Valide un schéma ERC-7730
   */
  private validateSchema(schema: ERC7730Schema): boolean {
    return !!(
      schema.$schema &&
      schema.context?.contract?.abi &&
      schema.metadata?.title &&
      schema.display?.definitions
    );
  }

  /**
   * Génère une description Clear Signing pour une fonction
   */
  async generateClearSigningDescription(
    contractType: string,
    functionName: string,
    params: Record<string, any>,
    chainId: number
  ): Promise<{
    title: string;
    description: string;
    details: Array<{ label: string; value: string; type: string }>;
    risks: Array<{ severity: string; message: string }>;
  } | null> {
    
    // Charger le schéma si pas déjà en cache
    let schema = this.schemas.get(contractType);
    if (!schema) {
      schema = await this.loadSchema(contractType);
      if (!schema) return null;
    }

    const functionDisplay = schema.display.definitions[functionName];
    if (!functionDisplay) {
      console.warn(`❌ Fonction ${functionName} non trouvée dans le schéma ${contractType}`);
      return null;
    }

    // Générer les détails des champs
    const details = functionDisplay.fields.map(field => {
      const value = this.getValueByPath(params, field.path);
      const formattedValue = this.formatValue(value, field.format, field.params, chainId);
      
      return {
        label: field.label,
        value: formattedValue,
        type: this.getFieldType(field.format)
      };
    });

    // Formater les risques
    const risks = functionDisplay.risks.map(risk => ({
      severity: risk.severity,
      message: risk.message
    }));

    return {
      title: `${schema.metadata.title}: ${functionDisplay.intent}`,
      description: functionDisplay.description,
      details,
      risks
    };
  }

  /**
   * Extrait une valeur d'un objet par chemin (ex: "user.address")
   */
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Formate une valeur selon son type ERC-7730
   */
  private formatValue(value: any, format: string, params?: any, chainId?: number): string {
    if (value === undefined || value === null) return 'N/A';

    switch (format) {
      case 'token':
        if (params?.token) {
          const amount = Number(value) / Math.pow(10, params.token.decimals || 18);
          return `${amount.toFixed(6)} ${params.token.symbol || 'TOKEN'}`;
        }
        return value.toString();

      case 'addressName':
        if (params?.types && params.types[value]) {
          return params.types[value];
        }
        return this.formatAddress(value);

      case 'addressFromBytes32':
        // Convertir bytes32 en adresse
        const address = `0x${value.slice(-40)}`;
        return this.formatAddress(address);

      case 'enum':
        if (params?.values && params.values[value]) {
          return params.values[value];
        }
        return value.toString();

      case 'raw':
      default:
        return value.toString();
    }
  }

  /**
   * Formate une adresse Ethereum
   */
  private formatAddress(address: string): string {
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      return 'Adresse nulle';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Détermine le type de champ pour l'affichage
   */
  private getFieldType(format: string): string {
    switch (format) {
      case 'token':
        return 'amount';
      case 'addressName':
      case 'addressFromBytes32':
        return 'address';
      default:
        return 'text';
    }
  }

  /**
   * Vérifie si un contrat a un schéma ERC-7730
   */
  async hasSchema(contractType: string): Promise<boolean> {
    if (this.schemas.has(contractType)) return true;
    
    const schema = await this.loadSchema(contractType);
    return schema !== null;
  }

  /**
   * Liste tous les schémas disponibles
   */
  getAvailableSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }
}

// Instance singleton
export const erc7730Registry = new ERC7730Registry();

// Export pour compatibilité
export default erc7730Registry; 