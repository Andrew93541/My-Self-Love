
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PairingSession } from '../types';
import { getMyPair } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  pair: PairingSession | null;
  login: (user: User) => void;
  logout: () => void;
  refreshPair: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pair, setPair] = useState<PairingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPair = (userId: string) => {
      const foundPair = getMyPair(userId);
      setPair(foundPair);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('mysafelove_current_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      loadPair(parsedUser.id);
    }
    setIsLoading(false);

    // Listen for updates (Pairing happens in another tab/component)
    const handleStorageChange = () => {
        if (user) loadPair(user.id);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localDataUpdated', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('localDataUpdated', handleStorageChange);
    };
  }, [user?.id]);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('mysafelove_current_user', JSON.stringify(newUser));
    loadPair(newUser.id);
  };

  const logout = () => {
    setUser(null);
    setPair(null);
    localStorage.removeItem('mysafelove_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, pair, login, logout, refreshPair: () => user && loadPair(user.id), isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
