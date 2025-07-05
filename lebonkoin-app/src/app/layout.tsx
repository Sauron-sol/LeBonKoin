import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeBonKoin - Marketplace Décentralisée",
  description: "Marketplace sécurisée avec World ID, paiements CCTP V2 et signature transparente ERC-7730",
  keywords: ["marketplace", "blockchain", "world id", "cctp", "erc-7730"],
  authors: [{ name: "LeBonKoin Team" }],
  openGraph: {
    title: "LeBonKoin - Marketplace Décentralisée",
    description: "Achetez et vendez en toute sécurité avec la vérification World ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 