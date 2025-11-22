
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Fingerprint, ScanFace } from 'lucide-react';
import { getSettings } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

interface SecurityLockProps {
  onUnlock: () => void;
}

export const SecurityLock: React.FC<SecurityLockProps> = ({ onUnlock }) => {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [settings] = useState(() => user ? getSettings(user.id) : getSettings(''));
  const [isLocked, setIsLocked] = useState(!!settings.pin);
  const [isScanning, setIsScanning] = useState(false);

  // If no PIN is set, auto-unlock
  useEffect(() => {
    if (!settings.pin) {
        setIsLocked(false);
        onUnlock();
    }
  }, [settings.pin, onUnlock]);

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        validatePin(newPin);
      }
    }
  };

  const validatePin = (inputPin: string) => {
    if (inputPin === settings.pin) {
      setTimeout(() => {
        setIsLocked(false);
        onUnlock();
      }, 300);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 500);
    }
  };

  const handleBiometric = () => {
    setIsScanning(true);
    // Simulate biometric delay
    setTimeout(() => {
        setIsScanning(false);
        setIsLocked(false);
        onUnlock();
    }, 1500);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl flex flex-col items-center justify-center text-gray-700 dark:text-gray-200 transition-colors">
       <div className="mb-8 flex flex-col items-center animate-bounce-slow relative">
         <div className="w-16 h-16 bg-pink-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-pink-500 mb-4 shadow-lg overflow-hidden relative">
           {isScanning ? (
                <>
                    <ScanFace size={32} className="animate-pulse" />
                    <motion.div 
                        className="absolute top-0 left-0 w-full h-1 bg-green-400 opacity-50 shadow-lg shadow-green-400"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </>
           ) : (
                pin.length === 4 && !error ? <Unlock size={32} /> : <Lock size={32} />
           )}
         </div>
         <h2 className="text-xl font-bold text-gray-700 dark:text-white font-rounded">
            {isScanning ? 'Verifying...' : 'Welcome Back'}
         </h2>
         <p className="text-sm text-gray-400">Enter PIN or Scan to access</p>
       </div>

       <div className="flex gap-4 mb-10 h-4">
         {[...Array(4)].map((_, i) => (
           <motion.div 
             key={i}
             animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
             className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? 'bg-pink-500 scale-110' : 'bg-gray-200 dark:bg-gray-700'}`}
           />
         ))}
       </div>

       <div className="grid grid-cols-3 gap-6 w-64 mb-6">
         {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
           <button 
             key={num}
             onClick={() => handleNumClick(num.toString())}
             className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-xl font-semibold text-gray-600 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-700 active:scale-90 transition-all"
           >
             {num}
           </button>
         ))}
         <button 
           onClick={handleBiometric}
           className="w-16 h-16 rounded-full flex items-center justify-center text-pink-500 bg-pink-50 dark:bg-gray-800 active:scale-90 transition-all"
         >
            <Fingerprint size={28} />
         </button>
         <button 
           onClick={() => handleNumClick('0')}
           className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-xl font-semibold text-gray-600 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-700 active:scale-90 transition-all"
         >
           0
         </button>
         <button 
           onClick={handleDelete}
           className="w-16 h-16 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 active:scale-90 transition-all"
         >
            ⌫
         </button>
       </div>
       
       <button onClick={handleBiometric} className="text-pink-500 text-sm font-medium animate-pulse">
            Tap for FaceID / Fingerprint
       </button>
    </div>
  );
};