import { useState, useEffect } from 'react';
import { Twitch, Youtube, AudioLines } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { initiateAuth as initiateTikTokAuth } from '../../services/tiktokAuth';
import { initiateAuth as initiateYoutubeAuth } from '../../services/youtubeAuth';
import { initiateAuth as initiateTwitchAuth } from '../../services/twitchAuth';
import { initiateAuth as initiateSpotifyAuth } from '../../services/spotifyAuth';

const Home = () => {
  const [creators, setCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initiates TikTok login
  const handleConnectTikTok = () => {
    console.log('Initiating TikTok login...');
    setIsLoading(true);
    try {
      initiateTikTokAuth();
    } catch (error) {
      setError('Failed to initiate TikTok login.');
      setIsLoading(false);
    }
  };

    // Initiates YouTube login
    const handleConnectYouTube = () => {
      console.log('Initiating YouTube login...');
      setIsLoading(true);
      try {
        initiateYoutubeAuth();
      } catch (error) {
        setError('Failed to initiate YouTube login.');
        setIsLoading(false);
      }
    };

    // Initiates Twitch login
    const handleConnectTwitch = () => {
      console.log('Initiating Twitch login...');
      setIsLoading(true);
      try {
        initiateTwitchAuth();
      } catch (error) {
        setError('Failed to initiate Twitch login.');
        setIsLoading(false);
      }
    };

      // Initiates Spotify login
    const handleConnectSpotify = () => {
      console.log('Initiating Spotify login...');
      setIsLoading(true);
      try {
        initiateSpotifyAuth();
      } catch (error) {
        setError('Failed to initiate Spotify login.');
        setIsLoading(false);
      }
    };

  // Fetch trending creators
  const fetchCreators = async () => {
    try {
      const response = await fetch('http://localhost:4000/creators');
      if (!response.ok) throw new Error('Failed to fetch creators');
      const data = await response.json();
      setCreators(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const platforms = [
    { name: 'Twitch', icon: Twitch, color: 'purple', action: handleConnectTwitch },
    { name: 'Spotify', icon: AudioLines, color: 'green', action: handleConnectSpotify },
    { name: 'Youtube', icon: Youtube, color: 'blue', action: handleConnectYouTube },
    { 
      name: 'TikTok',
      icon: FaTiktok,
      color: '#000000',
      action: handleConnectTikTok,
    },
  ];

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Connect Accounts</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {platforms.map(({ name, icon: Icon, color, action }) => (
          <button
            key={name}
            onClick={action ? action : undefined}
            className={`p-4 rounded-lg bg-white shadow-md flex flex-col items-center space-y-2 hover:bg-gray-50`}
          >
            <Icon className={`text-${color}-500`} size={24} />
            <span className="text-sm">{name}</span>
          </button>
        ))}
      </div>

      {isLoading && <p className="text-blue-500">Redirecting...</p>}
      {error && <p className="text-red-500">{error}</p>}

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
