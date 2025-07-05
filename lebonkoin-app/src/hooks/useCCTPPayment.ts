"use client";

import { useState, useCallback } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, encodeFunctionData, Address } from "viem";
import { getCCTPConfig, CCTPTransferParams, FAST_TRANSFER_CONFIG, STANDARD_TRANSFER_CONFIG } from "@/lib/cctp";
import { generateERC7730Metadata } from "@/lib/erc7730";

interface UseCCTPPaymentOptions {
  useFastTransfer?: boolean;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

interface CCTPPaymentState {
  isLoading: boolean;
  txHash?: string;
  error?: string;
  attestationHash?: string;
}

export function useCCTPPayment(options: UseCCTPPaymentOptions = {}) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const [state, setState] = useState<CCTPPaymentState>({
    isLoading: false,
  });

  const sendCCTPPayment = useCallback(async (params: Omit<CCTPTransferParams, 'maxFee' | 'minFinalityThreshold'>) => {
    if (!address) {
      throw new Error("Wallet non connecté");
    }

    try {
      setState({ isLoading: true });

      const config = getCCTPConfig(chainId);
      const transferConfig = options.useFastTransfer ? FAST_TRANSFER_CONFIG : STANDARD_TRANSFER_CONFIG;

      // Préparer les paramètres de transfert
      const transferParams: CCTPTransferParams = {
        ...params,
        maxFee: transferConfig.maxFee,
        minFinalityThreshold: transferConfig.minFinalityThreshold,
      };

      // Générer les métadonnées ERC-7730 pour Clear Signing
      const erc7730Metadata = generateERC7730Metadata(
        config.TokenMessengerV2,
        "0xf856ddb6", // depositForBurn selector
        {
          amount: transferParams.amount.toString(),
          destinationDomain: transferParams.destinationDomain,
          mintRecipient: transferParams.mintRecipient,
          maxFee: transferParams.maxFee.toString(),
        }
      );

      console.log("📋 ERC-7730 Clear Signing Metadata:", erc7730Metadata);

      // Appeler le contrat CCTP V2
      if (transferParams.hookData) {
        // Utiliser depositForBurnWithHook pour les actions automatiques
        writeContract({
          address: config.TokenMessengerV2,
          abi: [
            {
              name: "depositForBurnWithHook",
              type: "function",
              stateMutability: "nonpayable",
              inputs: [
                { name: "amount", type: "uint256" },
                { name: "destinationDomain", type: "uint32" },
                { name: "mintRecipient", type: "bytes32" },
                { name: "burnToken", type: "address" },
                { name: "destinationCaller", type: "bytes32" },
                { name: "maxFee", type: "uint256" },
                { name: "minFinalityThreshold", type: "uint32" },
                { name: "hookData", type: "bytes" },
              ],
              outputs: [{ name: "nonce", type: "uint64" }],
            },
          ],
          functionName: "depositForBurnWithHook",
          args: [
            transferParams.amount,
            transferParams.destinationDomain,
            transferParams.mintRecipient,
            config.USDC,
            transferParams.destinationCaller || "0x0000000000000000000000000000000000000000000000000000000000000000",
            transferParams.maxFee,
            transferParams.minFinalityThreshold,
            transferParams.hookData,
          ],
        });
      } else {
        // Utiliser depositForBurn standard
        writeContract({
          address: config.TokenMessengerV2,
          abi: [
            {
              name: "depositForBurn",
              type: "function",
              stateMutability: "nonpayable",
              inputs: [
                { name: "amount", type: "uint256" },
                { name: "destinationDomain", type: "uint32" },
                { name: "mintRecipient", type: "bytes32" },
                { name: "burnToken", type: "address" },
                { name: "destinationCaller", type: "bytes32" },
                { name: "maxFee", type: "uint256" },
                { name: "minFinalityThreshold", type: "uint32" },
              ],
              outputs: [{ name: "nonce", type: "uint64" }],
            },
          ],
          functionName: "depositForBurn",
          args: [
            transferParams.amount,
            transferParams.destinationDomain,
            transferParams.mintRecipient,
            config.USDC,
            transferParams.destinationCaller || "0x0000000000000000000000000000000000000000000000000000000000000000",
            transferParams.maxFee,
            transferParams.minFinalityThreshold,
          ],
        });
      }

      setState(prev => ({ ...prev, txHash: hash }));
      
      if (options.onSuccess && hash) {
        options.onSuccess(hash);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du paiement CCTP";
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error(errorMessage));
      }
    }
  }, [address, chainId, writeContract, hash, options]);

  const waitForAttestation = useCallback(async (txHash: string): Promise<string> => {
    // Attendre l'attestation de Circle
    // Pour Fast Transfer: 8-20 secondes
    // Pour Standard Transfer: 13-19 minutes
    
    const maxAttempts = options.useFastTransfer ? 30 : 300; // 30 tentatives pour Fast, 300 pour Standard
    const delay = options.useFastTransfer ? 2000 : 5000; // 2s pour Fast, 5s pour Standard

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Appeler l'API Circle pour récupérer l'attestation
        const response = await fetch(`https://iris-api.circle.com/v2/messages/${txHash}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.attestation) {
            setState(prev => ({ ...prev, attestationHash: data.attestation }));
            return data.attestation;
          }
        }

        // Attendre avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        console.error("Erreur lors de la récupération de l'attestation:", error);
      }
    }

    throw new Error("Timeout: Attestation non reçue");
  }, [options.useFastTransfer]);

  const estimateTransferTime = useCallback(() => {
    return options.useFastTransfer ? "8-20 secondes" : "13-19 minutes";
  }, [options.useFastTransfer]);

  const getTransferFee = useCallback(() => {
    const config = options.useFastTransfer ? FAST_TRANSFER_CONFIG : STANDARD_TRANSFER_CONFIG;
    return Number(config.maxFee) / 1e6; // Convertir en USDC
  }, [options.useFastTransfer]);

  return {
    sendCCTPPayment,
    waitForAttestation,
    estimateTransferTime,
    getTransferFee,
    isLoading: state.isLoading || isConfirming,
    txHash: state.txHash || hash,
    error: state.error || writeError?.message,
    attestationHash: state.attestationHash,
    isConfirming,
  };
} 