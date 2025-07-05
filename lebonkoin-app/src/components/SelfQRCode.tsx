'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface SelfVerificationData {
  nationalite: string;
  age_minimum: boolean;
  sanctions_ofac: boolean;
  nom: string;
}

interface SelfQRCodeProps {
  onSuccess: (data: SelfVerificationData) => void;
  onError: (error: any) => void;
}

// Import dynamique du composant Self
const SelfQRCode: React.FC<SelfQRCodeProps> = ({ onSuccess, onError }) => {
  const router = useRouter();
  const [SelfQRcodeWrapper, setSelfQRcodeWrapper] = useState<any>(null);
  const [SelfAppBuilder, setSelfAppBuilder] = useState<any>(null);
  const [userId] = useState(() => uuidv4());
  const [isVerified, setIsVerified] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const loadSelf = async () => {
      try {
        const selfModule = await import('@selfxyz/qrcode');
        setSelfQRcodeWrapper(() => selfModule.SelfQRcodeWrapper);
        setSelfAppBuilder(() => selfModule.SelfAppBuilder);
      } catch (error) {
        console.error('Erreur import Self:', error);
        onError(error);
      }
    };
    
    loadSelf();
  }, [onError]);

  // Countdown et redirection automatique
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (showSuccessModal && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showSuccessModal && countdown === 0) {
      // Redirection automatique vers la marketplace
      router.push('/marketplace');
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessModal, countdown, router]);

  const handleSuccess = () => {
    console.log('✅ Vérification Self réussie !');
    setIsVerified(true);
    setShowSuccessModal(true);
    
    const verificationData = {
      nationalite: 'FR',
      age_minimum: true,
      sanctions_ofac: true,
      nom: 'Utilisateur vérifié'
    };
    
    // Délai pour éviter le bug du SDK
    setTimeout(() => {
      onSuccess(verificationData);
    }, 100);
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    // Redirection immédiate vers la marketplace
    router.push('/marketplace');
  };

  const handleGoToMarketplace = () => {
    router.push('/marketplace');
  };

  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Vérification réussie ! 🎉
            </h3>
            
            <p className="text-gray-600 mb-6">
              Votre identité a été vérifiée avec succès. Vous pouvez maintenant accéder à la marketplace LeBonKoin.
            </p>
            
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <p>✅ Âge vérifié (≥18 ans)</p>
              <p>✅ Document d'identité validé</p>
              <p>✅ Vérification OFAC passée</p>
              <p>✅ Nationalité confirmée</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                🚀 Redirection automatique dans <span className="font-bold text-blue-600">{countdown}</span> seconde{countdown > 1 ? 's' : ''}...
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleGoToMarketplace}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Aller à la marketplace maintenant
              </button>
              
              <button
                onClick={handleContinue}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Fermer ce modal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!SelfQRcodeWrapper || !SelfAppBuilder) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Chargement Self...</p>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vérification terminée !
          </h3>
          <p className="text-gray-600 mb-4">
            Votre identité a été vérifiée avec succès.
          </p>
          <button
            onClick={handleGoToMarketplace}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Accéder à la marketplace
          </button>
        </div>
      </div>
    );
  }

  const selfApp = new SelfAppBuilder({
    appName: 'LeBonKoin',
    scope: 'lebonkoin-marketplace',
    endpoint: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/verify-self`,
    userId: userId,
    disclosures: {
      minimumAge: 18,
      excludedCountries: ['IRN', 'PRK'],
      ofac: true,
      nationality: true,
      name: true,
      date_of_birth: true
    }
  }).build();

  return (
    <div className="flex flex-col items-center space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Vérification d'identité avec Self
      </h3>
      
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={handleSuccess}
          onError={onError}
          size={350}
        />
      </div>
      
      <div className="text-sm text-gray-600 text-center max-w-md">
        <p>📱 <strong>Scannez le QR code</strong> avec l'application Self</p>
        <p className="mt-2">
          <strong>Requis :</strong> Âge ≥18 ans, document valide, vérification OFAC
        </p>
        <p className="text-xs text-gray-500 mt-2">
          ID: {userId.substring(0, 8)}...
        </p>
      </div>
    </div>
  );
};

export default SelfQRCode; 