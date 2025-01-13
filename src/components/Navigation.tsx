import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, PlaySquare, Coins, Gift } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/campaigns', icon: PlaySquare, label: 'Campaigns' },
    { path: '/token', icon: Coins, label: 'Token' },
    { path: '/rewards', icon: Gift, label: 'Rewards' },
    { path: '/migration', icon: Gift, label: 'migration' }
  ];

  return (
    <nav className="bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center space-y-1 w-full py-2 ${
                isActive ? 'text-green-500' : 'text-gray-500'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;