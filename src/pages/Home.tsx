import { useState } from 'react';
import { Twitch, Youtube, AudioLines } from 'lucide-react';
import { FaTiktok } from "react-icons/fa";
import { initiateAuth } from '../services/auth';

const Home = () => {
  const [creators, setCreators] = useState([]);

  // Function to initiate TikTok login
  const handleConnectTikTok = () => {
    /* window.location.href = 'http://localhost:4000/auth/tiktok'; */
    initiateAuth();
  };

  // Fetch creators dynamically (e.g., from an API)
  const fetchCreators = async () => {
    try {
      const response = await fetch('http://localhost:4000/creators');
      if (!response.ok) throw new Error('Failed to fetch creators');
      const data = await response.json();
      setCreators(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const platforms = [
    { name: 'Twitch', icon: Twitch, color: 'purple' },
    { name: 'Spotify', icon: AudioLines, color: 'pink' },
    { name: 'Youtube', icon: Youtube, color: 'blue' },
    { 
    name: 'TikTok',
    icon: FaTiktok,
    color: '#000000', // Official TikTok black
    action: handleConnectTikTok 
  },
  ];

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Connect Accounts</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {platforms.map(({ name, icon: Icon, color, action }) => (
          <button
            key={name}
            onClick={action}
            className={`p-4 rounded-lg bg-white shadow-md flex flex-col items-center space-y-2 hover:bg-gray-50`}
          >
            <Icon className={`text-${color}-500`} size={24} />
            <span className="text-sm">{name}</span>
          </button>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Trending Creators</h2>
      <div className="space-y-4">
        {creators.length > 0 ? (
          creators.map((creator) => (
            <div key={creator.id} className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{creator.name}</h3>
                <p className="text-sm text-gray-500">
                  {creator.platform} • {creator.followers} followers
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No creators available.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
