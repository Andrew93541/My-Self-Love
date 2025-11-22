
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Droplets, Moon, Sun, Settings as SettingsIcon, BookHeart, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHealthTip, getComfortMessage } from '../services/geminiService';
import { getTodayLog, getSettings } from '../services/storageService';
import { DailyLog } from '../types';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tip, setTip] = useState<string>("Loading daily sparkle...");
  const [log, setLog] = useState<DailyLog | null>(null);
  const [message, setMessage] = useState<string>("");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (user) {
        const userSettings = getSettings(user.id);
        setSettings(userSettings);
        
        const todayLog = getTodayLog(user.id);
        setLog(todayLog);

        getHealthTip().then(setTip);
        if (todayLog.mood) {
            getComfortMessage(todayLog.mood, "Dashboard View").then(setMessage);
        }
    }
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (!log || !settings) return <div className="p-8 text-center text-gray-400">Loading your sanctuary...</div>;

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
          <h1 className="text-3xl font-bold text-gray-800 font-rounded">
            {greeting()}, <span className="text-pink-500">{settings.name || user?.name}</span>
          </h1>
        </div>
        <Link to="/settings" className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-pink-100 active:scale-95 transition-transform">
             <SettingsIcon size={20} className="text-gray-400" />
        </Link>
      </motion.div>

      {/* AI Quote Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-3xl shadow-sm mb-6 relative overflow-hidden"
      >
        <div className="absolute -right-4 -top-4 opacity-20 text-8xl">🪷</div>
        <h3 className="font-bold text-gray-700 mb-2 relative z-10">Daily Whisper</h3>
        <p className="text-gray-600 italic relative z-10">"{tip}"</p>
        {message && <p className="text-pink-600 mt-3 text-sm font-medium bg-white/50 p-2 rounded-lg inline-block">💌 {message}</p>}
      </motion.div>

      {/* Quick Status Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-50 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
            <Droplets size={20} />
          </div>
          <span className="text-2xl font-bold text-gray-700">{log.waterIntake}ml</span>
          <span className="text-xs text-gray-400">Water</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
            <Moon size={20} />
          </div>
          <span className="text-2xl font-bold text-gray-700">{log.sleepHours}h</span>
          <span className="text-xs text-gray-400">Sleep</span>
        </div>
      </div>

      {/* New Features Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link to="/diary" className="bg-white p-4 rounded-2xl shadow-sm border border-pink-50 flex items-center gap-3 hover:bg-pink-50 transition-colors">
            <div className="bg-pink-100 p-2 rounded-xl text-pink-500">
                <BookHeart size={20} />
            </div>
            <div>
                <p className="font-bold text-gray-700 text-sm">Heart Notes</p>
                <p className="text-[10px] text-gray-400">Private Diary</p>
            </div>
        </Link>
        <Link to="/moments" className="bg-white p-4 rounded-2xl shadow-sm border border-pink-50 flex items-center gap-3 hover:bg-pink-50 transition-colors">
            <div className="bg-purple-100 p-2 rounded-xl text-purple-500">
                <Image size={20} />
            </div>
            <div>
                <p className="font-bold text-gray-700 text-sm">Moments</p>
                <p className="text-[10px] text-gray-400">Photo Gallery</p>
            </div>
        </Link>
      </div>

      {/* Reminder Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 font-rounded">Reminders</h2>
        <div className="space-y-3">
           <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-pink-400">
              <div className="flex items-center gap-3">
                <div className="bg-pink-50 p-2 rounded-lg text-pink-500">
                    <Bell size={18} />
                </div>
                <div>
                    <p className="font-semibold text-gray-700">Take Vitamins</p>
                    <p className="text-xs text-gray-400">10:00 AM • Daily</p>
                </div>
              </div>
              <input type="checkbox" className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 border-gray-300" defaultChecked={log.medicationsTaken} />
           </div>
           
           <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-green-400">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-lg text-green-600">
                    <Sun size={18} />
                </div>
                <div>
                    <p className="font-semibold text-gray-700">Freshen Up</p>
                    <p className="text-xs text-gray-400">2:00 PM • Face Mist</p>
                </div>
              </div>
              <button className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500">Done</button>
           </div>
        </div>
      </div>

    </div>
  );
};
