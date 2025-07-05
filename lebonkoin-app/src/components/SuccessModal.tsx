interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash: string;
  amount: string;
  sourceChain: number;
  targetChain: number;
  listingTitle: string;
  finalizationStatus?: 'pending' | 'completed' | 'error';
  onRefreshBalances?: () => void;
}

export function SuccessModal({
  isOpen,
  onClose,
  txHash,
  amount,
  sourceChain,
  targetChain,
  listingTitle,
  finalizationStatus = 'completed',
  onRefreshBalances
}: SuccessModalProps) {
  if (!isOpen) return null;

  const getExplorerUrl = (chainId: number, hash: string) => {
    const explorers = {
      11155111: 'https://sepolia.etherscan.io', // Ethereum Sepolia
      84532: 'https://sepolia.basescan.org',    // Base Sepolia
      43113: 'https://testnet.snowtrace.io',    // Avalanche Fuji
      421614: 'https://sepolia.arbiscan.io',    // Arbitrum Sepolia
      59141: 'https://sepolia.lineascan.build'  // Linea Sepolia
    };
    const explorer = explorers[chainId as keyof typeof explorers] || 'https://etherscan.io';
    return `${explorer}/tx/${hash}`;
  };

  const getChainName = (chainId: number) => {
    const names = {
      11155111: 'Ethereum Sepolia',
      84532: 'Base Sepolia',
      43113: 'Avalanche Fuji',
      421614: 'Arbitrum Sepolia',
      59141: 'Linea Sepolia'
    };
    return names[chainId as keyof typeof names] || `Chain ${chainId}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        {/* Animation de succès */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h2>
          <p className="text-gray-600">
            Votre achat a été effectué avec succès
          </p>
        </div>

        {/* Détails de la transaction */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Détails</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Article:</span>
                <span className="font-medium text-right">{listingTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant:</span>
                <span className="font-bold text-green-600">{amount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">De:</span>
                <span className="font-medium">{getChainName(sourceChain)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vers:</span>
                <span className="font-medium">{getChainName(targetChain)}</span>
              </div>
            </div>
          </div>

          {/* Statut de finalisation Cross-Chain */}
          {sourceChain !== targetChain && (
            <div className={`border rounded-lg p-4 ${
              finalizationStatus === 'pending' 
                ? 'bg-yellow-50 border-yellow-200'
                : finalizationStatus === 'error'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                finalizationStatus === 'pending' 
                  ? 'text-yellow-900'
                  : finalizationStatus === 'error'
                  ? 'text-orange-900'
                  : 'text-green-900'
              }`}>
                {finalizationStatus === 'pending' && '⏳ Finalisation en cours...'}
                {finalizationStatus === 'error' && '🎯 Finalisation automatique via Circle'}
                {finalizationStatus === 'completed' && '✅ Transfert finalisé'}
              </h4>
              <p className={`text-sm ${
                finalizationStatus === 'pending' 
                  ? 'text-yellow-800'
                  : finalizationStatus === 'error'
                  ? 'text-orange-800'
                  : 'text-green-800'
              }`}>
                {finalizationStatus === 'pending' && 
                  'Votre transfert va automatiquement se finaliser sur Base Sepolia dans quelques minutes. Les USDC arriveront dans votre wallet sans action de votre part.'
                }
                {finalizationStatus === 'error' && 
                  'Votre transfert CCTP est réussi ! Circle va automatiquement finaliser le transfert vers Base Sepolia dans 5-15 minutes. Aucune action requise de votre part.'
                }
                {finalizationStatus === 'completed' && 
                  'Votre transfert est complètement finalisé sur les deux chaînes.'
                }
              </p>
            </div>
          )}

          {/* Lien vers la transaction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              🔗 Transaction sur la blockchain
            </h4>
            <p className="text-blue-800 text-sm mb-3">
              Hash: <span className="font-mono text-xs break-all">{txHash}</span>
            </p>
            <a
              href={getExplorerUrl(sourceChain, txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <span>Voir sur l'explorateur</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Fermer
          </button>
          {onRefreshBalances && (
            <button
              onClick={() => {
                onRefreshBalances();
                // Petite indication visuelle
              }}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              🔄 Soldes
            </button>
          )}
          <button
            onClick={() => {
              // Copier le hash de transaction
              navigator.clipboard.writeText(txHash);
              // Optionnel: Afficher une notification
            }}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            📋 Copier
          </button>
        </div>
      </div>
    </div>
  );
} 