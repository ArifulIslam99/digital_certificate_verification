'use client';

import { useWallet } from '@suiet/wallet-kit';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const wallet = useWallet();
  const [error, setError] = useState<string>('');
  const [showWalletDropdown, setShowWalletDropdown] = useState<boolean>(false);

  const handleConnect = async (walletName: string) => {
    setError('');
    console.log('Attempting to connect wallet:', walletName);

    try {
      await wallet.select(walletName);
      console.log('Wallet selection initiated for:', walletName);
      setShowWalletDropdown(false);
    } catch (error) {
      console.error('Connection error:', error);
      setError('Failed to connect wallet. Check console for details.');
    }
  };

  const toggleWalletDropdown = () => {
    setError('');
    console.log('Wallet state:', wallet);
    console.log('Available wallets:', wallet.allAvailableWallets);

    if (!wallet.allAvailableWallets || wallet.allAvailableWallets.length === 0) {
      setError('No Sui-compatible wallets detected. Please install a Sui-compatible wallet (e.g., Sui Wallet).');
      console.error('No wallets available or wallet.allAvailableWallets is undefined');
      return;
    }

    setShowWalletDropdown(!showWalletDropdown);
  };

  return (
    <header className="flex justify-between items-center p-4 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold hover:underline">
          Certificate Portal
        </Link>
        <Link href="/admin" className="text-lg hover:underline">
          Admin Portal
        </Link>
        <Link href="/faculties" className="text-lg hover:underline">
          Faculty Portal
        </Link>
      </div>
      <div className="flex items-center gap-4 relative">
        {wallet.connected ? (
          <>
            <span className="px-4 py-2 rounded bg-green-100 text-green-700 font-semibold">
              ✅ {wallet.account?.address.slice(0, 6)}...{wallet.account?.address.slice(-4)}
            </span>
            <button
              onClick={() => {
                console.log('Disconnecting wallet...');
                wallet.disconnect();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Disconnect
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleWalletDropdown}
              className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100"
            >
              Connect Wallet
            </button>
            {showWalletDropdown && wallet.allAvailableWallets && wallet.allAvailableWallets.length > 0 && (
              <div className="absolute top-12 right-0 bg-white rounded shadow-lg z-10">
                {wallet.allAvailableWallets.map((w) => (
                  <button
                    key={w.name}
                    onClick={() => handleConnect(w.name)}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            )}
            {error && <p className="text-red-300 text-sm absolute top-12 right-0">{error}</p>}
          </>
        )}
      </div>
    </header>
  );
}