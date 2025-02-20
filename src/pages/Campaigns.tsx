// import React from 'react';
import { Play, PauseCircle, Settings } from 'lucide-react';

const Campaigns = () => {
  const campaigns = [
    {
      id: 1,
      name: 'Gaming Stream Promotion',
      type: 'Automatic',
      status: 'Active',
      budget: '500 SOL',
      performance: '12.5K views'
    },
    {
      id: 2,
      name: 'Tech Review Sponsorship',
      type: 'Manual',
      status: 'Pending',
      budget: '300 SOL',
      performance: '8.2K views'
    }
  ];

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaign Management</h1>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Play size={20} />
          <span>New Campaign</span>
        </button>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{campaign.name}</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {campaign.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p>Type: {campaign.type}</p>
                <p>Budget: {campaign.budget}</p>
              </div>
              <div>
                <p>Performance: {campaign.performance}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button aria-label='settings' className="p-2 text-gray-500 hover:text-gray-700">
                <Settings size={20} />
              </button>
              <button aria-label='pause' className="p-2 text-gray-500 hover:text-gray-700">
                <PauseCircle size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Campaigns;
