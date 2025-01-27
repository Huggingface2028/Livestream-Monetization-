// import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowLeftRight, TrendingUp } from 'lucide-react';

const Token = () => {
  const { connected } = useWallet();

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Token Purchase</h1>

      {!connected ? (
        <div className="text-center py-8">
          <p className="mb-4">Connect your wallet to purchase tokens</p>
          <WalletMultiButton className="!bg-green-500 hover:!bg-green-600" />
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Token Price</h2>
              <TrendingUp className="text-green-500" />
            </div>
            <div className="text-3xl font-bold mb-2">$0.85 USD</div>
            <p className="text-sm text-gray-500">+5.2% in last 24h</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Purchase Tokens</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (SOL)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="0.0"
                />
              </div>
              <div className="flex justify-center">
                <ArrowLeftRight className="text-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  You'll receive (Platform Token)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="0.0"
                  disabled
                />
              </div>
              <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">
                Purchase Tokens
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Bridge Tokens</h2>
            <p className="text-sm text-gray-600 mb-4">
              Bridge your tokens between Ethereum and Solana networks
            </p>
            <button className="w-full border border-green-500 text-green-500 py-3 rounded-lg hover:bg-green-50">
              Open Bridge
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Token;