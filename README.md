# 🛒 LeBonKoin - Decentralized Marketplace

> **The future of peer-to-peer trading with Web3 security, transparency, and seamless cross-chain payments**

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by Circle CCTP](https://img.shields.io/badge/Powered%20by-Circle%20CCTP-00D4FF?style=for-the-badge)](https://www.circle.com/cctp)
[![Secured by Self ID](https://img.shields.io/badge/Secured%20by-Self%20ID-6B46C1?style=for-the-badge)](https://self.id/)
[![Clear Signing ERC-7730](https://img.shields.io/badge/Clear%20Signing-ERC--7730-FF6B35?style=for-the-badge)](https://eips.ethereum.org/EIPS/eip-7730)

## 🌟 Overview

LeBonKoin revolutionizes peer-to-peer marketplaces by combining the simplicity of traditional classified ads with cutting-edge Web3 technology. Users can buy and sell products with **verified identity**, **transparent transactions**, and **instant cross-chain payments** - all while maintaining privacy and security.

### 🎯 Key Features

- **🔐 Privacy-First Identity Verification** - Self SDK for age, nationality, and OFAC compliance
- **⚡ Instant Cross-Chain Payments** - Circle CCTP V2 for seamless USDC transfers
- **💸 Gasless Transactions** - Circle Paymaster for USDC-only payments
- **📝 Transparent Signing** - Ledger ERC-7730 Clear Signing for readable transactions
- **🌐 Multi-Chain Support** - Ethereum, Avalanche, Base, Arbitrum, and more
- **🛡️ Scam Prevention** - Real identity verification without compromising anonymity

## 🏗️ Technology Stack

### 🔑 Core Partner Integrations

#### **Ledger ERC-7730 Clear Signing**
- Transforms cryptic transaction data into human-readable descriptions
- Users see "Buy iPhone 14 Pro - 500 USDC" instead of "0x23b872dd000000..."
- Prevents phishing attacks and builds user confidence
- Custom metadata registry for marketplace-specific transactions

#### **Circle CCTP V2 + Paymaster**
- Native cross-chain USDC transfers without bridges
- Gasless transactions - users only pay in USDC
- Support for fast transfers with finality thresholds
- Seamless multi-chain marketplace experience

#### **Self SDK Identity Verification**
- Privacy-preserving age verification (≥18 years)
- Nationality and OFAC sanctions screening
- QR code-based verification flow
- Anonymous yet compliant user onboarding

### 🛠️ Technical Implementation

```
Frontend:         Next.js 14, TypeScript, Tailwind CSS
Smart Contracts:  Solidity, Hardhat, Circle Paymaster
Identity:         Self SDK, QR Code verification
Payments:         CCTP V2, USDC, Multi-chain support
Signing:          ERC-7730 metadata, Clear Signing
Database:         Prisma, PostgreSQL
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible wallet
- USDC on supported testnets

### Installation

```bash
# Clone the repository
git clone https://github.com/Sauron-sol/LeBonKoin.git
cd LeBonKoin/lebonkoin-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys and configuration

# Run the development server
npm run dev
```

### Environment Setup

```env
# Circle CCTP Configuration
NEXT_PUBLIC_CIRCLE_API_KEY=your_circle_api_key

# Self SDK Configuration  
NEXT_PUBLIC_SELF_APP_ID=your_self_app_id

# Blockchain Configuration
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_sepolia_rpc
NEXT_PUBLIC_AVALANCHE_RPC_URL=your_avalanche_rpc

# ngrok for Self verification
NEXT_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

## 🎮 How It Works

### 1. **Identity Verification**
```
User connects wallet → Scans Self QR code → Verifies age/nationality/OFAC → Access granted
```

### 2. **Listing Products**
```
Create listing → Set price in USDC → Choose supported chains → Publish with clear signing
```

### 3. **Making Purchases**
```
Browse products → Select item → Choose payment chain → Approve with clear signing → Instant cross-chain payment
```

### 4. **Transaction Flow**
```
USDC approval → CCTP burn on source chain → Attestation → Mint on destination chain → Product transfer
```

## 📁 Project Structure

```
lebonkoin-app/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   ├── marketplace/       # Marketplace pages
│   │   └── create-listing/    # Product creation
│   ├── components/            # React components
│   │   ├── SelfQRCode.tsx    # Self verification
│   │   ├── MultichainPayment.tsx # CCTP payments
│   │   └── GaslessPayment.tsx # Circle Paymaster
│   ├── hooks/                 # Custom React hooks
│   │   ├── useCCTPPayment.ts # Cross-chain logic
│   │   └── useCirclePaymaster.ts # Gasless transactions
│   ├── lib/                   # Core utilities
│   │   ├── cctp.ts           # Circle CCTP integration
│   │   ├── self.tsx          # Self SDK provider
│   │   ├── erc7730.ts        # Clear signing metadata
│   │   └── smartAccount.ts   # Account abstraction
│   └── types/                 # TypeScript definitions
├── contracts/                 # Smart contracts
│   └── CirclePaymaster.sol   # Custom paymaster
├── public/
│   └── erc7730/              # Clear signing metadata
└── scripts/                   # Deployment scripts
```

## 🌟 Innovation Highlights

### **🔐 Security Through Transparency**
- Every transaction shows clear, human-readable information
- Users always know exactly what they're signing
- Eliminates blind signing vulnerabilities

### **⚡ Seamless Cross-Chain UX**
- One-click purchases across any supported blockchain
- No manual bridge interactions or complex workflows
- Native USDC transfers without third-party risks

### **🛡️ Privacy-First Compliance**
- Verify user legitimacy without revealing personal data
- Age and sanctions screening with zero-knowledge proofs
- Build trust while maintaining anonymity

### **💸 Web2-Level Payment Experience**
- Pay only in USDC - no gas token management
- Instant settlements across chains
- Traditional e-commerce simplicity in Web3

## 🏆 Hackathon Integration

This project showcases innovative use of three major partner technologies:

- **🔶 Ledger**: Advanced ERC-7730 implementation for marketplace transparency
- **🔵 Circle**: Full CCTP V2 + Paymaster integration for seamless payments  
- **🟣 Self**: Privacy-preserving identity verification for trusted marketplace

## 📊 Supported Networks

| Network   | CCTP Support | Fast Transfers | Testnet          |
| --------- | ------------ | -------------- | ---------------- |
| Ethereum  | ✅            | ✅              | Sepolia          |
| Avalanche | ✅            | ✅              | Fuji             |
| Base      | ✅            | ✅              | Base Sepolia     |
| Arbitrum  | ✅            | ✅              | Arbitrum Sepolia |

## 🔗 Live Demo

- **Application**: [https://423a-193-248-172-169.ngrok-free.app](https://423a-193-248-172-169.ngrok-free.app)
- **Repository**: [https://github.com/Sauron-sol/LeBonKoin](https://github.com/Sauron-sol/LeBonKoin)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

---

**Built with ❤️ for the future of decentralized commerce**
