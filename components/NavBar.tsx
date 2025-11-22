
import React from 'react';
import { Heart, Activity, Shield, Home, MessageCircleHeart, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const NavBar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const isProtector = user?.role === 'protector';

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
    { path: '/chat', icon: MessageCircleHeart, label: 'Chat', special: true },
    { path: '/medical', icon: Activity, label: 'Medical' }, // Both can view medical (Protector read only)
    // Protector sees "Monitor" instead of "Safe"
    { path: '/emergency', icon: isProtector ? ShieldCheck : Shield, label: isProtector ? 'Monitor' : 'Safe', alert: !isProtector },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-pink-100 dark:border-gray-700 pb-safe z-50 h-[80px]">
      <div className="flex justify-around items-center h-full max-w-md mx-auto px-4 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.special) {
             return (
                <Link to={item.path} key={item.path}>
                    <div className={`p-4 rounded-full shadow-lg -mt-6 border-4 border-white dark:border-gray-800 transform active:scale-95 transition-transform relative ${isProtector ? 'bg-gradient-to-tr from-blue-400 to-indigo-500' : 'bg-gradient-to-tr from-pink-400 to-rose-400'}`}>
                        <Icon className="w-6 h-6 text-white" />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                </Link>
             )
          }

          return (
            <Link to={item.path} key={item.path} className="flex flex-col items-center gap-1 w-16">
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive(item.path) ? (isProtector ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/50' : 'bg-pink-100 text-pink-500 dark:bg-pink-900/50') : 'text-gray-400'} ${item.alert ? 'text-red-400' : ''}`}>
                <Icon className={`w-6 h-6 ${isActive(item.path) && 'fill-current'}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive(item.path) ? (isProtector ? 'text-blue-500' : 'text-pink-500') : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
