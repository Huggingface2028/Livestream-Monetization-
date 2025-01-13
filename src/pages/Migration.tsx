import React, { useState } from 'react';
import { Download, Upload, Users, Video, Heart, Bookmark, CheckCircle, AlertCircle } from 'lucide-react';

interface MigrationStatus {
  videos: number;
  saved: number;
  liked: number;
  followers: number;
}

const Migration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [targetPlatform, setTargetPlatform] = useState('');
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    videos: 0,
    saved: 0,
    liked: 0,
    followers: 0
  });
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState('');

  const platforms = [
    { id: 'youtube', name: 'YouTube Shorts' },
    { id: 'instagram', name: 'Instagram Reels' },
    { id: 'snapchat', name: 'Snapchat Spotlight' }
  ];

  const handleTikTokConnect = () => {
    // Implement TikTok OAuth here
    setIsConnected(true);
    setError('');
  };

  const handleMigration = async () => {
    if (!targetPlatform) {
      setError('Please select a target platform');
      return;
    }

    setIsMigrating(true);
    setError('');

    try {
      // Simulate migration process
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMigrationStatus({
          videos: Math.floor(i * 0.3),
          saved: Math.floor(i * 0.2),
          liked: Math.floor(i * 0.3),
          followers: Math.floor(i * 0.2)
        });
      }
    } catch (err) {
      setError('Migration failed. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Transfer Your TikTok Content</h1>
        <p className="text-gray-600">
          Seamlessly migrate your TikTok videos, saved content, and followers to another platform
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Download className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Connect TikTok</h2>
              <p className="text-gray-500 text-sm">Link your TikTok account to begin</p>
            </div>
          </div>
          <button
            onClick={handleTikTokConnect}
            disabled={isConnected}
            className={`px-6 py-2 rounded-lg ${
              isConnected
                ? 'bg-green-100 text-green-700'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isConnected ? 'Connected' : 'Connect Account'}
          </button>
        </div>

        {isConnected && (
          <>
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Select Target Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setTargetPlatform(platform.id)}
                    className={`p-4 rounded-lg border-2 ${
                      targetPlatform === platform.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {platform.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Migration Progress</h3>
                <button
                  onClick={handleMigration}
                  disabled={isMigrating || !targetPlatform}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {isMigrating ? 'Migrating...' : 'Start Migration'}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Video size={20} className="text-gray-600" />
                    <span className="font-medium">Videos</span>
                  </div>
                  <p className="text-2xl font-bold">{migrationStatus.videos}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bookmark size={20} className="text-gray-600" />
                    <span className="font-medium">Saved</span>
                  </div>
                  <p className="text-2xl font-bold">{migrationStatus.saved}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart size={20} className="text-gray-600" />
                    <span className="font-medium">Liked</span>
                  </div>
                  <p className="text-2xl font-bold">{migrationStatus.liked}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users size={20} className="text-gray-600" />
                    <span className="font-medium">Followers</span>
                  </div>
                  <p className="text-2xl font-bold">{migrationStatus.followers}</p>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Migration Details</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <CheckCircle className="text-green-500 mt-1" size={20} />
            <div>
              <h4 className="font-medium">Secure Transfer</h4>
              <p className="text-gray-600 text-sm">Your content is transferred securely with end-to-end encryption</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <CheckCircle className="text-green-500 mt-1" size={20} />
            <div>
              <h4 className="font-medium">Metadata Preservation</h4>
              <p className="text-gray-600 text-sm">All video captions, hashtags, and engagement metrics are preserved</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <CheckCircle className="text-green-500 mt-1" size={20} />
            <div>
              <h4 className="font-medium">Follower Migration</h4>
              <p className="text-gray-600 text-sm">Automated follower notification system to maintain your community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Migration;