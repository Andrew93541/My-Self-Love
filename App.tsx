
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Medical } from './pages/Medical';
import { Wellness } from './pages/Wellness';
import { Emergency } from './pages/Emergency';
import { Chat } from './pages/Chat';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Diary } from './pages/Diary';
import { Moments } from './pages/Moments';
import { Pairing } from './pages/Pairing';
import { NavBar } from './components/NavBar';
import { FloatingPetals } from './components/FloatingPetals';
import { AnimalCompanions } from './components/AnimalCompanions';
import { SecurityLock } from './components/SecurityLock';
import { useAuth } from './context/AuthContext';
import { getSettings } from './services/storageService';

const AppContent: React.FC = () => {
  const { user, pair, isLoading } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Apply Dark Mode Effect
  useEffect(() => {
    if (user) {
        const settings = getSettings(user.id);
        if (settings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
  }, [user]);

  if (isLoading) {
    return <div className="min-h-screen bg-pink-50 dark:bg-gray-900 flex items-center justify-center text-pink-300">Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans selection:bg-pink-200">
      <SecurityLock onUnlock={handleUnlock} />
      
      {isUnlocked && (
        <>
          <FloatingPetals />
          <AnimalCompanions />
          
          <div className="relative z-10 h-screen flex flex-col">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/medical" element={<Medical />} />
                <Route path="/wellness" element={<Wellness />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/moments" element={<Moments />} />
                <Route path="/pairing" element={<Pairing />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
          </div>

          <NavBar />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
