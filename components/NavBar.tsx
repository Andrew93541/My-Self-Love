import React from 'react';
import { Heart, Activity, Shield, Home, MessageCircleHeart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const NavBar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
    { path: '/chat', icon: MessageCircleHeart, label: 'Love Chat', special: true },
    { path: '/medical', icon: Activity, label: 'Medical' },
    { path: '/emergency', icon: Shield, label: 'Safe', alert: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pink-100 pb-safe z-50 h-[80px]">
      <div className="flex justify-around items-center h-full max-w-md mx-auto px-4 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.special) {
             return (
                <Link to={item.path} key={item.path}>
                    <div className="bg-gradient-to-tr from-pink-400 to-rose-400 p-4 rounded-full shadow-lg -mt-6 border-4 border-white transform active:scale-95 transition-transform relative">
                        <Icon className="w-6 h-6 text-white" />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                </Link>
             )
          }

          return (
            <Link to={item.path} key={item.path} className="flex flex-col items-center gap-1 w-16">
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive(item.path) ? 'bg-pink-100 text-pink-500' : 'text-gray-400'} ${item.alert ? 'text-red-400' : ''}`}>
                <Icon className={`w-6 h-6 ${isActive(item.path) && 'fill-current'}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive(item.path) ? 'text-pink-500' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
