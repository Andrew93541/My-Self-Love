
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Droplets, Moon, Sun, Settings as SettingsIcon, BookHeart, Image, ShieldCheck, Heart, Activity, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHealthTip, getComfortMessage } from '../services/geminiService';
import { getTodayLog, getSettings, getPartnerId, getPartnerLocation } from '../services/storageService';
import { DailyLog, LocationData } from '../types';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, pair } = useAuth();
  const [tip, setTip] = useState<string>("Loading...");
  const [log, setLog] = useState<DailyLog | null>(null);
  const [message, setMessage] = useState<string>("");
  const [settings, setSettings] = useState<any>(null);
  
  // Protector Specific States
  const [partnerLog, setPartnerLog] = useState<DailyLog | null>(null);
  const [partnerSettings, setPartnerSettings] = useState<any>(null);
  const [partnerLoc, setPartnerLoc] = useState<LocationData | null>(null);

  const fetchData = () => {
    if (user) {
        const userSettings = getSettings(user.id);
        setSettings(userSettings);

        if (user.role === 'protected') {
            // Load Girl's Data
            const todayLog = getTodayLog(user.id);
            setLog(todayLog);
            getHealthTip().then(setTip);
            if (todayLog.mood) {
                getComfortMessage(todayLog.mood, "Dashboard View").then(setMessage);
            }
        } else {
            // Load Protector's View (Partner Data)
            const partnerId = getPartnerId(user.id);
            if (partnerId) {
                const pLog = getTodayLog(partnerId);
                const pSettings = getSettings(partnerId);
                const pLoc = getPartnerLocation(partnerId);
                setPartnerLog(pLog);
                setPartnerSettings(pSettings);
                setPartnerLoc(pLoc);
            }
            setTip("Remind her she's beautiful today! 💖");
        }
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listen for real-time updates from partner
    window.addEventListener('storage', fetchData);
    window.addEventListener('localDataUpdated', fetchData);
    return () => {
        window.removeEventListener('storage', fetchData);
        window.removeEventListener('localDataUpdated', fetchData);
    }
  }, [user, pair]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (!settings) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  // --- PROTECTOR DASHBOARD (Boyfriend) ---
  if (user?.role === 'protector') {
      return (
        <div className="pb-24 px-6 pt-8 max-w-md mx-auto h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <p className="text-slate-400 text-sm font-medium font-rounded uppercase tracking-wider">Guardian Mode</p>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-rounded">
                        Hi, <span className="text-blue-500">{settings.name}</span>
                    </h1>
                </div>
                <Link to="/settings" className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center border border-slate-100 dark:border-gray-700 active:scale-95 transition-transform">
                    <SettingsIcon size={20} className="text-slate-400" />
                </Link>
            </div>

            {/* Connection Status Card */}
            <div className={`p-6 rounded-3xl shadow-sm mb-6 flex items-center justify-between ${pair ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <div>
                    <h3 className="font-bold text-lg mb-1">{pair ? 'Connected to Partner' : 'No Partner Linked'}</h3>
                    <p className="text-xs opacity-80">{pair ? 'Monitoring safety & wellness' : 'Go to Pairing screen to link'}</p>
                </div>
                <ShieldCheck size={32} className="opacity-80" />
            </div>

            {/* Her Status Overview */}
            {pair && partnerLog ? (
                <>
                    <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 font-rounded">Her Status Today</h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-pink-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Heart size={16} className="text-pink-500" />
                                <span className="text-xs text-gray-400 font-bold uppercase">Mood</span>
                            </div>
                            <p className="text-xl font-bold text-gray-700 dark:text-white">
                                {partnerLog.mood ? partnerLog.mood : 'Not logged'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
                             <div className="flex items-center gap-2 mb-2">
                                <Droplets size={16} className="text-blue-500" />
                                <span className="text-xs text-gray-400 font-bold uppercase">Water</span>
                            </div>
                            <p className="text-xl font-bold text-gray-700 dark:text-white">
                                {partnerLog.waterIntake}ml
                            </p>
                        </div>
                         <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 col-span-2">
                             <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-green-500" />
                                    <span className="text-xs text-gray-400 font-bold uppercase">Last Location</span>
                                </div>
                                <span className="text-[10px] text-gray-400">
                                    {partnerLoc ? new Date(partnerLoc.timestamp).toLocaleTimeString() : 'Unknown'}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-white truncate">
                                {partnerLoc ? `${partnerLoc.latitude.toFixed(4)}, ${partnerLoc.longitude.toFixed(4)}` : 'Waiting for update...'}
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl text-center text-gray-400 mb-6 border border-gray-100 dark:border-gray-700">
                    Waiting for partner data...
                </div>
            )}

            {/* Guardian Tip */}
             <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl shadow-sm border border-indigo-100 dark:border-indigo-800 relative overflow-hidden"
            >
                <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">Protector Tip</h3>
                <p className="text-indigo-600 dark:text-indigo-400 italic">"{tip}"</p>
            </motion.div>

             <div className="grid grid-cols-2 gap-4 mt-6">
                <Link to="/chat" className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-pink-50 dark:border-gray-700 flex items-center justify-center gap-2 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors">
                    <Heart className="text-pink-500" />
                    <span className="font-bold text-gray-700 dark:text-white">Send Love</span>
                </Link>
                <Link to="/moments" className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-purple-50 dark:border-gray-700 flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors">
                    <Image className="text-purple-500" />
                    <span className="font-bold text-gray-700 dark:text-white">Moments</span>
                </Link>
            </div>
        </div>
      );
  }

  // --- PROTECTED DASHBOARD (Girlfriend) ---
  return (
    <div className="pb-24 px-6 pt-8 max-w-md mx-auto h-full overflow-y-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <p className="text-gray-400 text-sm font-medium font-rounded uppercase tracking-wider">Welcome Back</p>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white font-rounded">
            {greeting()}, <span className="text-pink-500">{settings.name || user?.name}</span>
          </h1>
        </div>
        <Link to="/settings" className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center border border-pink-100 dark:border-gray-700 active:scale-95 transition-transform">
             <SettingsIcon size={20} className="text-gray-400" />
        </Link>
      </motion.div>

      {/* AI Quote Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 p-6 rounded-3xl shadow-sm mb-6 relative overflow-hidden"
      >
        <div className="absolute -right-4 -top-4 opacity-20 text-8xl">🪷</div>
        <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2 relative z-10">Daily Whisper</h3>
        <p className="text-gray-600 dark:text-gray-300 italic relative z-10">"{tip}"</p>
        {message && <p className="text-pink-600 dark:text-pink-300 mt-3 text-sm font-medium bg-white/50 dark:bg-black/30 p-2 rounded-lg inline-block">💌 {message}</p>}
      </motion.div>

      {/* Quick Status Grid */}
      {log && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-blue-50 dark:border-gray-700 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-500">
                <Droplets size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-700 dark:text-white">{log.waterIntake}ml</span>
              <span className="text-xs text-gray-400">Water</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-indigo-50 dark:border-gray-700 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-500">
                <Moon size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-700 dark:text-white">{log.sleepHours}h</span>
              <span className="text-xs text-gray-400">Sleep</span>
            </div>
          </div>
      )}

      {/* New Features Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link to="/diary" className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-pink-50 dark:border-gray-700 flex items-center gap-3 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors">
            <div className="bg-pink-100 dark:bg-pink-900 p-2 rounded-xl text-pink-500">
                <BookHeart size={20} />
            </div>
            <div>
                <p className="font-bold text-gray-700 dark:text-white text-sm">Heart Notes</p>
                <p className="text-[10px] text-gray-400">Private Diary</p>
            </div>
        </Link>
        <Link to="/moments" className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-pink-50 dark:border-gray-700 flex items-center gap-3 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-xl text-purple-500">
                <Image size={20} />
            </div>
            <div>
                <p className="font-bold text-gray-700 dark:text-white text-sm">Moments</p>
                <p className="text-[10px] text-gray-400">Photo Gallery</p>
            </div>
        </Link>
      </div>

      {/* Reminder Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 font-rounded">Reminders</h2>
        {log && (
            <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-pink-400">
                <div className="flex items-center gap-3">
                    <div className="bg-pink-50 dark:bg-pink-900/50 p-2 rounded-lg text-pink-500">
                        <Bell size={18} />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-700 dark:text-white">Take Vitamins</p>
                        <p className="text-xs text-gray-400">10:00 AM • Daily</p>
                    </div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 border-gray-300" defaultChecked={log.medicationsTaken} />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-green-400">
                <div className="flex items-center gap-3">
                    <div className="bg-green-50 dark:bg-green-900/50 p-2 rounded-lg text-green-600">
                        <Sun size={18} />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-700 dark:text-white">Freshen Up</p>
                        <p className="text-xs text-gray-400">2:00 PM • Face Mist</p>
                    </div>
                </div>
                <button className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-500 dark:text-gray-300">Done</button>
            </div>
            </div>
        )}
      </div>

    </div>
  );
};
