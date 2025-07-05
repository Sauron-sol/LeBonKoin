'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
  reset: () => void;
}

const SelfContext = createContext<SelfContextType | undefined>(undefined);

export function SelfProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selfProof, setSelfProof] = useState<SelfProof | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const triggerSelfVerification = useCallback(() => {
    setShowQRCode(true);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setSelfProof(null);
    setError(null);
    setShowQRCode(false);
  }, []);

  // Fonction appelée quand la vérification Self réussit
  const handleSelfSuccess = useCallback((verificationData: SelfProof) => {
    console.log('✅ Vérification Self réussie:', verificationData);
    setSelfProof(verificationData);
    setShowQRCode(false);
    setIsLoading(false);
  }, []);

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