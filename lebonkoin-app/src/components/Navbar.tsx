"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo.svg" 
              alt="LebonKoin Logo" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-white">LebonKoin</span>
          </Link>
          
          <div className="flex-1 max-w-2xl mx-8 bg-white rounded-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items"
                className="w-full px-4 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Rechercher"
                aria-label="Rechercher"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className={`hover:text-gray-300 transition-colors ${
                isActive('/') ? 'bg-blue-600 text-white px-3 py-2 rounded-lg font-medium' : 'text-white'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/marketplace" 
              className={`hover:text-gray-300 transition-colors ${
                isActive('/marketplace') ? 'bg-green-600 text-white px-3 py-2 rounded-lg font-medium' : 'text-white'
              }`}
            >
              Marketplace
            </Link>
            {isConnected ? (
              <ConnectButton />
            ) : (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // Cette fonction sera définie dans chaque page qui utilise la navbar
                  if (typeof window !== 'undefined' && (window as any).openAuthModal) {
                    (window as any).openAuthModal();
                  }
                }}
              >
                🐰 Rabbit Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 