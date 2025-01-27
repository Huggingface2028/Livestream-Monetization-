// import React from 'react';
import { Gift, Award, Coins } from 'lucide-react';

const Rewards = () => {
  const rewards = [
    {
      title: 'Staking Rewards',
      amount: '250 Tokens',
      status: 'Available',
      icon: Coins
    },
    {
      title: 'Community Airdrop',
      amount: '100 Tokens',
      status: 'Locked',
      icon: Gift
    },
    {
      title: 'Governance Reward',
      amount: '50 Tokens',
      status: 'Claimed',
      icon: Award
    }
  ];

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Rewards & Airdrops</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Total Rewards</h2>
          <div className="text-3xl font-bold text-green-500">400 Tokens</div>
          <p className="text-sm text-gray-500 mt-1">≈ $340 USD</p>
        </div>
      </div>

      <div className="space-y-4">
        {rewards.map((reward) => {
          const Icon = reward.icon;
          return (
            <div key={reward.title} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon className="text-green-500" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{reward.title}</h3>
                  <p className="text-sm text-gray-500">{reward.amount}</p>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg text-sm ${
                    reward.status === 'Available'
                      ? 'bg-green-500 text-white'
                      : reward.status === 'Locked'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  disabled={reward.status !== 'Available'}
                >
                  {reward.status}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Staking</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Stake
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter amount"
            />
          </div>
          <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">
            Stake Tokens
          </button>
        </div>
      </div>
    </div>
  );
};

export default Rewards;