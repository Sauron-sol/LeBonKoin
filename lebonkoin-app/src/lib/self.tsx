'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAccount } from 'wagmi';

// Types pour Self SDK
interface SelfProof {
  attestationId: number;
  nationality: string;
  olderThan: string;
  name: string[];
  userIdentifier: string;
  isOlderThanValid: boolean;
  isOfacValid: boolean;
  timestamp: string;
}

interface SelfContextType {
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;
  selfProof: SelfProof | null;
  showQRCode: boolean;
  triggerSelfVerification: () => void;
  handleSelfSuccess: (verificationData: any) => void;
  handleSelfError: (errorMessage: string) => void;
  reset: () => void;
}

const SelfContext = createContext<SelfContextType | undefined>(undefined);

export function SelfProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selfProof, setSelfProof] = useState<SelfProof | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  // Clé pour le localStorage basée sur l'adresse du wallet
  const getStorageKey = (walletAddress: string) => `self_verification_${walletAddress.toLowerCase()}`;

  // Charger l'état de vérification depuis le localStorage au changement d'adresse
  useEffect(() => {
    if (!address || !isConnected) {
      // Réinitialiser l'état si pas de wallet connecté
      setSelfProof(null);
      setError(null);
      setShowQRCode(false);
      console.log('🔌 Wallet déconnecté - État Self réinitialisé');
      return;
    }

    // Charger la vérification existante pour cette adresse
    const storageKey = getStorageKey(address);
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsedProof = JSON.parse(stored);
        setSelfProof(parsedProof);
        setError(null);
        setShowQRCode(false);
        console.log('✅ Vérification Self chargée depuis le localStorage pour', address);
        console.log('📊 Données Self récupérées:', parsedProof);
      } catch (err) {
        console.error('Erreur lors du parsing de la vérification Self:', err);
        localStorage.removeItem(storageKey);
      }
    } else {
      // Pas de vérification existante pour cette adresse
      setSelfProof(null);
      setError(null);
      setShowQRCode(false);
      console.log('📝 Nouvelle adresse wallet - Aucune vérification Self trouvée');
    }
  }, [address, isConnected]);

  // Sauvegarder la vérification dans le localStorage
  const saveVerificationToStorage = useCallback((proof: SelfProof, walletAddress: string) => {
    const storageKey = getStorageKey(walletAddress);
    localStorage.setItem(storageKey, JSON.stringify(proof));
    console.log('💾 Vérification Self sauvegardée dans localStorage pour', walletAddress);
  }, []);

  const triggerSelfVerification = useCallback(() => {
    if (!address) {
      setError('Veuillez connecter votre wallet d\'abord');
      return;
    }

    // Vérifier si déjà vérifié pour cette adresse
    if (selfProof) {
      // Ne rien faire si déjà vérifié - l'étape sera automatiquement 'marketplace'
      console.log('Utilisateur déjà vérifié avec cette adresse wallet');
      return;
    }

    setShowQRCode(true);
    setError(null);
  }, [address, selfProof]);

  const reset = useCallback(() => {
    if (address) {
      // Supprimer la vérification du localStorage pour cette adresse
      const storageKey = getStorageKey(address);
      localStorage.removeItem(storageKey);
    }
    
    setSelfProof(null);
    setError(null);
    setShowQRCode(false);
  }, [address]);

  // Fonction appelée quand la vérification Self réussit
  const handleSelfSuccess = useCallback((verificationData: any) => {
    if (!address) return;

    console.log('✅ Vérification Self réussie:', verificationData);
    
    // Transformer les données en format SelfProof
    const proof: SelfProof = {
      attestationId: Date.now(), // ID temporaire
      nationality: verificationData.nationalite || 'FR',
      olderThan: '18',
      name: [verificationData.nom || 'Utilisateur vérifié'],
      userIdentifier: address,
      isOlderThanValid: verificationData.age_minimum || true,
      isOfacValid: verificationData.sanctions_ofac || true,
      timestamp: new Date().toISOString()
    };
    
    // Sauvegarder dans le localStorage
    saveVerificationToStorage(proof, address);
    
    setSelfProof(proof);
    setShowQRCode(false);
    setIsLoading(false);
    setError(null);
    
    console.log('🔄 État Self mis à jour, isVerified:', true);
  }, [address, saveVerificationToStorage]);

  // Fonction appelée en cas d'erreur
  const handleSelfError = useCallback((errorMessage: string) => {
    console.error('❌ Erreur Self:', errorMessage);
    setError(errorMessage);
    setShowQRCode(false);
    setIsLoading(false);
  }, []);

  const value: SelfContextType = {
    isVerified: !!selfProof,
    isLoading,
    error,
    selfProof,
    showQRCode,
    triggerSelfVerification,
    handleSelfSuccess,
    handleSelfError,
    reset,
  };

  return (
    <SelfContext.Provider value={value}>
      {children}
    </SelfContext.Provider>
  );
}

export function useSelf() {
  const context = useContext(SelfContext);
  if (!context) {
    throw new Error('useSelf must be used within a SelfProvider');
  }
  return context;
} 