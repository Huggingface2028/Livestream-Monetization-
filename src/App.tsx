import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import Token from './pages/Token';
import Rewards from './pages/Rewards';
import { WalletProvider } from './components/WalletProvider';
import Migration from './pages/Migration';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="h-screen flex flex-col bg-gray-100">
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/token" element={<Token />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/migration" element={<Migration />} />
            </Routes>
          </main>
          <Navigation />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
