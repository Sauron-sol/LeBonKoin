// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/interfaces/UserOperation.sol";

/**
 * @title CirclePaymaster
 * @dev Paymaster ERC-4337 qui permet aux utilisateurs de payer les frais de gas en USDC
 * Compatible avec le challenge Circle Paymaster ($2,000)
 * Version simplifiée pour le hackathon
 */
contract CirclePaymaster is IPaymaster, Ownable {
    using SafeERC20 for IERC20;

    // Variables d'état
    IEntryPoint public immutable entryPoint;
    IERC20 public immutable usdc;

    // Taux de change USDC/ETH (en wei par USDC, 6 décimales)
    uint256 public usdcToEthRate = 2500 * 1e12; // 1 USDC = 0.0025 ETH par défaut

    // Events
    event UserOperationSponsored(
        address indexed user,
        uint256 usdcAmount,
        uint256 ethAmount,
        bytes32 userOpHash
    );

    event UsdcToEthRateUpdated(uint256 oldRate, uint256 newRate);

    constructor(
        IEntryPoint _entryPoint,
        IERC20 _usdc,
        address _owner
    ) Ownable(_owner) {
        entryPoint = _entryPoint;
        usdc = _usdc;
    }

    /**
     * @dev Valide et sponsorise une UserOperation
     * @param userOp La UserOperation à valider
     * @param userOpHash Le hash de la UserOperation
     * @param maxCost Le coût maximum en ETH
     * @return context Les données de contexte pour postOp
     * @return validationData Les données de validation
     */
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external override returns (bytes memory context, uint256 validationData) {
        require(msg.sender == address(entryPoint), "Seul EntryPoint autorise");

        // Récupérer l'utilisateur depuis la UserOperation
        address user = userOp.sender;

        // Calculer le coût en USDC (avec une marge de sécurité réduite)
        uint256 requiredUsdcAmount = ((maxCost * 1e6) / usdcToEthRate) + 1e5; // +0.1 USDC de marge

        // Vérifier que l'utilisateur a suffisamment d'USDC
        uint256 userUsdcBalance = usdc.balanceOf(user);
        require(
            userUsdcBalance >= requiredUsdcAmount,
            "Solde USDC insuffisant"
        );

        // Vérifier l'allowance
        uint256 allowance = usdc.allowance(user, address(this));
        require(allowance >= requiredUsdcAmount, "Allowance USDC insuffisante");

        // Prélever l'USDC
        usdc.safeTransferFrom(user, address(this), requiredUsdcAmount);

        // Contexte pour postOp
        context = abi.encode(user, requiredUsdcAmount, maxCost);

        // Validation réussie (pas de limite de temps)
        validationData = 0;

        emit UserOperationSponsored(
            user,
            requiredUsdcAmount,
            maxCost,
            userOpHash
        );
    }

    /**
     * @dev Appelé après l'exécution de la UserOperation
     * @param mode Le mode d'exécution
     * @param context Le contexte de validatePaymasterUserOp
     * @param actualGasCost Le coût réel en gas
     */
    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external override {
        require(msg.sender == address(entryPoint), "Seul EntryPoint autorise");

        (address user, uint256 usdcAmount, uint256 maxCost) = abi.decode(
            context,
            (address, uint256, uint256)
        );

        // Si l'opération a échoué, rembourser l'USDC
        if (mode == PostOpMode.postOpReverted) {
            usdc.safeTransfer(user, usdcAmount);
            return;
        }

        // Calculer le coût réel en USDC
        uint256 actualUsdcCost = (actualGasCost * 1e6) / usdcToEthRate;

        // Rembourser l'excédent d'USDC
        if (usdcAmount > actualUsdcCost) {
            uint256 refund = usdcAmount - actualUsdcCost;
            usdc.safeTransfer(user, refund);
        }
    }

    /**
     * @dev Met à jour le taux de change USDC/ETH
     * @param newRate Le nouveau taux (en wei par USDC)
     */
    function updateUsdcToEthRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Taux invalide");
        uint256 oldRate = usdcToEthRate;
        usdcToEthRate = newRate;
        emit UsdcToEthRateUpdated(oldRate, newRate);
    }

    /**
     * @dev Dépose de l'ETH pour sponsoriser les transactions
     */
    function deposit() external payable onlyOwner {
        entryPoint.depositTo{value: msg.value}(address(this));
    }

    /**
     * @dev Retire l'ETH du dépôt EntryPoint
     * @param amount Le montant à retirer
     */
    function withdrawDeposit(uint256 amount) external onlyOwner {
        entryPoint.withdrawTo(payable(owner()), amount);
    }

    /**
     * @dev Retire l'USDC accumulé
     * @param amount Le montant à retirer
     */
    function withdrawUsdc(uint256 amount) external onlyOwner {
        usdc.safeTransfer(owner(), amount);
    }

    /**
     * @dev Obtient le dépôt actuel dans l'EntryPoint
     * @return Le montant déposé
     */
    function getDeposit() external view returns (uint256) {
        return entryPoint.balanceOf(address(this));
    }

    /**
     * @dev Calcule le coût en USDC pour un montant ETH donné
     * @param ethAmount Le montant en ETH (wei)
     * @return Le montant équivalent en USDC
     */
    function calculateUsdcCost(
        uint256 ethAmount
    ) external view returns (uint256) {
        return (ethAmount * 1e6) / usdcToEthRate;
    }
}
