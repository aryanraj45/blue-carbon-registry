import React, { useMemo, ReactNode } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Import the wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaWalletProviderProps {
  children: ReactNode;
}

const SolanaWalletProvider = ({ children }: SolanaWalletProviderProps) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // Use reliable default Solana RPC endpoints
  const endpoint = useMemo(() => {
    // Use official Solana RPC endpoints which are more reliable than third-party demos
    const endpoints = [
      // Official Solana devnet RPC
      clusterApiUrl(network),
      // Alternative official endpoints
      'https://api.devnet.solana.com',
      // Backup endpoints
      'https://devnet.solana.com',
    ];

    // Use the primary official endpoint
    return endpoints[0];
  }, [network]);

  // Memoize the wallets array to avoid re-instantiating wallet adapters on every render
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider 
      endpoint={endpoint}
      config={{
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
      }}
    >
      <WalletProvider 
        wallets={wallets} 
        autoConnect
        onError={(error) => {
          console.error('Wallet error:', error);
          // You can add custom error handling here
        }}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Exporting with React.memo prevents the component from re-rendering if its props (children) do not change.
export default React.memo(SolanaWalletProvider);