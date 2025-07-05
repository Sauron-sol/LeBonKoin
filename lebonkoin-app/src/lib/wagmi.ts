import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, baseSepolia, arbitrumSepolia, avalancheFuji, lineaSepolia, worldchain } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "LeBonKoin - Marketplace Décentralisée",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "temp_project_id_for_development",
  chains: [sepolia, baseSepolia, arbitrumSepolia, avalancheFuji, lineaSepolia, worldchain],
  ssr: true,
});

// Configuration des chaînes supportées par CCTP (testnets)
export const CCTP_SUPPORTED_CHAINS = [
  11155111, // Ethereum Sepolia
  84532,    // Base Sepolia
  421614,   // Arbitrum Sepolia
  43113,    // Avalanche Fuji
  59141,    // Linea Sepolia
];

// Vérifier si CCTP est supporté sur une chaîne
export function isCCTPSupported(chainId: number): boolean {
  return CCTP_SUPPORTED_CHAINS.includes(chainId);
}

// Vérifier si les transferts rapides sont supportés
export function isFastTransferSupported(chainId: number): boolean {
  // Pour l'instant, tous les réseaux CCTP supportent les transferts rapides
  return isCCTPSupported(chainId);
} 