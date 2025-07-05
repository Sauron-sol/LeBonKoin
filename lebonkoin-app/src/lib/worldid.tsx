"use client";

import { createContext, useContext, useCallback, useState, ReactNode, useEffect } from "react";
import { IDKitWidget, ISuccessResult, VerificationLevel, IErrorState } from "@worldcoin/idkit";

interface WorldIDContextType {
  isVerified: boolean;
  worldIdProof: ISuccessResult | null;
  triggerWorldIDWidget: () => void;
  resetVerification: () => void;
  isLoading: boolean;
  error: string | null;
}

const WorldIDContext = createContext<WorldIDContextType | undefined>(undefined);

export function WorldIDProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [worldIdProof, setWorldIdProof] = useState<ISuccessResult | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    try {
      setMounted(true);
      
      // Intercepter les erreurs console de Radix UI en mode développement
      if (process.env.NODE_ENV === 'development') {
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.error = (...args: any[]) => {
          // Filtrer les erreurs d'accessibilité de Radix UI
          const message = args[0];
          if (typeof message === 'string') {
            if (
              message.includes('DialogContent') && 
              (message.includes('DialogTitle') || message.includes('Description'))
            ) {
              // Ignorer ces erreurs spécifiques
              return;
            }
          }
          // Passer toutes les autres erreurs
          originalError.apply(console, args);
        };
        
        console.warn = (...args: any[]) => {
          // Filtrer les warnings d'accessibilité de Radix UI
          const message = args[0];
          if (typeof message === 'string') {
            if (
              message.includes('DialogContent') && 
              (message.includes('DialogTitle') || message.includes('Description'))
            ) {
              // Ignorer ces warnings spécifiques
              return;
            }
          }
          // Passer tous les autres warnings
          originalWarn.apply(console, args);
        };
        
        // Nettoyer à la destruction du composant
        return () => {
          console.error = originalError;
          console.warn = originalWarn;
        };
      }
    } catch (err) {
      console.error("Erreur lors de l'initialisation World ID:", err);
      setError("Erreur lors de l'initialisation World ID");
    }
  }, []);

  const handleSuccess = useCallback(async (result: ISuccessResult) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("✅ Vérification World ID réussie:", result);
      
      // Vérifier la preuve via notre API
      const response = await fetch("/api/verify-world-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof: result.proof,
          merkle_root: result.merkle_root,
          nullifier_hash: result.nullifier_hash,
          verification_level: result.verification_level
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Vérification API réussie:", data);
        setWorldIdProof(result);
        setIsVerified(true);
      } else {
        const errorData = await response.json();
        console.error("❌ Erreur lors de la vérification API:", errorData);
        setError("Erreur lors de la vérification API");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la vérification:", error);
      setError("Erreur lors de la vérification");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleError = useCallback((error: IErrorState) => {
    console.error("❌ Erreur World ID:", error);
    setError(`Erreur World ID: ${error.code || 'Erreur inconnue'}`);
    setIsLoading(false);
  }, []);

  const triggerWorldIDWidget = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Déclencher le widget en cliquant sur le bouton invisible
      const button = document.getElementById('world-id-trigger-button');
      if (button) {
        button.click();
      } else {
        setError("Widget World ID non trouvé");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Erreur lors du déclenchement du widget:", err);
      setError("Erreur lors du déclenchement du widget");
      setIsLoading(false);
    }
  }, []);

  const resetVerification = useCallback(() => {
    setIsVerified(false);
    setWorldIdProof(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Fallback si pas encore monté
  if (!mounted) {
    return (
      <WorldIDContext.Provider
        value={{
          isVerified: false,
          worldIdProof: null,
          triggerWorldIDWidget: () => {},
          resetVerification: () => {},
          isLoading: false,
          error: null,
        }}
      >
        {children}
      </WorldIDContext.Provider>
    );
  }

  return (
    <WorldIDContext.Provider
      value={{
        isVerified,
        worldIdProof,
        triggerWorldIDWidget,
        resetVerification,
        isLoading,
        error,
      }}
    >
      {children}
      
      {/* Widget World ID caché avec bouton trigger invisible */}
      <div style={{ display: 'none' }}>
        <IDKitWidget
          app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`}
          action="verify"
          verification_level={VerificationLevel.Device}
          handleVerify={handleSuccess}
          onSuccess={() => console.log("✅ Widget World ID ouvert avec succès")}
          onError={handleError}
        >
          {({ open }) => (
            <button
              id="world-id-trigger-button"
              onClick={open}
              style={{ display: 'none' }}
            >
              Trigger World ID
            </button>
          )}
        </IDKitWidget>
      </div>
    </WorldIDContext.Provider>
  );
}

export function useWorldID() {
  const context = useContext(WorldIDContext);
  if (context === undefined) {
    throw new Error("useWorldID must be used within a WorldIDProvider");
  }
  return context;
} 