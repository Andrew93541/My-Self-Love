
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Calendar, Settings, Heart, Info, ToggleLeft, ToggleRight } from 'lucide-react';
import { getTodayLog, saveTodayLog, getSettings, saveSettings } from '../services/storageService';
import { getComfortMessage } from '../services/geminiService';
import { MoodType, DailyLog, UserSettings } from '../types';
import { useAuth } from '../context/AuthContext';

export const Wellness: React.FC = () => {
  const { user } = useAuth();
  const [log, setLog] = useState<DailyLog>(() => user ? getTodayLog(user.id) : getTodayLog(''));
  const [settings, setSettingsState] = useState<UserSettings>(() => user ? getSettings(user.id) : getSettings(''));
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isBreathing, setIsBreathing] = useState(false);

  // Helper to update settings
  const updateSettings = (updates: Partial<UserSettings>) => {
    if (!user) return;
    const newSettings = { ...settings, ...updates };
    setSettingsState(newSettings);
    saveSettings(user.id, newSettings);
  };

  // Advanced Cycle Calculation
  const getCycleDetails = () => {
    if (!settings.lastPeriodDate) return null;
    
    const last = new Date(settings.lastPeriodDate);
    // Next period start
    const next = new Date(last);
    next.setDate(last.getDate() + settings.cycleLength);
    
    // Ovulation (approx 14 days before next period)
    const ovulation = new Date(next);
    ovulation.setDate(next.getDate() - 14);
    
    // Fertile window (5 days before ovulation + ovulation day + 1 day after)
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(ovulation.getDate() - 5);
    
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(ovulation.getDate() + 1);

    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = next.getTime() - today.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { 
        next, 
        fertileStart, 
        fertileEnd, 
        daysUntil,
        isPeriodNow: daysUntil <= 0 && daysUntil > -5 // Simple assumption for "now"
    };
  };

  const cycleData = getCycleDetails();

  const updateWater = (amount: number) => {
    if (!user) return;
    const newLog = { ...log, waterIntake: Math.max(0, log.waterIntake + amount) };
    setLog(newLog);
    saveTodayLog(user.id, newLog);
  };

  const setMood = async (mood: MoodType) => {
    if (!user) return;
    const newLog = { ...log, mood };
    setLog(newLog);
    saveTodayLog(user.id, newLog);
    const msg = await getComfortMessage(mood, "User just selected this mood in the wellness tracker.");
    setAiResponse(msg);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="pb-24 px-6 pt-8 max-w-md mx-auto h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-800 font-rounded mb-6">Wellness Center</h1>

      {/* Dedicated Period Tracking Section */}
      <div className="bg-white rounded-3xl shadow-sm mb-6 border border-pink-100 overflow-hidden">
        {/* Header with Toggle */}
        <div className="bg-pink-50/50 p-4 flex justify-between items-center border-b border-pink-100">
            <div className="flex items-center gap-2">
                <Heart className="text-pink-500 fill-current" size={18} />
                <h3 className="font-bold text-gray-700">Cycle Tracker</h3>
            </div>
            <button 
                onClick={() => updateSettings({ isPeriodTrackingEnabled: !settings.isPeriodTrackingEnabled })}
                className="text-pink-500 transition-colors"
            >
                {settings.isPeriodTrackingEnabled 
                    ? <ToggleRight size={28} /> 
                    : <ToggleLeft size={28} className="text-gray-300" />
                }
            </button>
        </div>

        <AnimatePresence>
            {settings.isPeriodTrackingEnabled && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-5 space-y-5">
                        {/* Status Card */}
                        <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-4 text-center border border-pink-200">
                            {cycleData ? (
                                <>
                                    <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-1">
                                        {cycleData.isPeriodNow ? "Current Phase" : "Next Period In"}
                                    </p>
                                    <h2 className="text-4xl font-bold text-pink-600 mb-1">
                                        {cycleData.isPeriodNow ? "Period" : `${cycleData.daysUntil} Days`}
                                    </h2>
                                    <p className="text-sm text-pink-800 opacity-70">
                                        {cycleData.isPeriodNow ? "Take care of yourself ❤️" : `Expected ${formatDate(cycleData.next)}`}
                                    </p>
                                </>
                            ) : (
                                <p className="text-pink-600 font-medium py-2">Set your dates below to see predictions</p>
                            )}
                        </div>

                        {/* Info Grid */}
                        {cycleData && !cycleData.isPeriodNow && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                    <div className="flex items-center gap-1 mb-1 text-orange-400">
                                        <Info size={12} />
                                        <span className="text-[10px] font-bold uppercase">Fertile Window</span>
                                    </div>
                                    <p className="text-sm font-semibold text-orange-800">
                                        {formatDate(cycleData.fertileStart)} - {formatDate(cycleData.fertileEnd)}
                                    </p>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-1 mb-1 text-purple-400">
                                        <Calendar size={12} />
                                        <span className="text-[10px] font-bold uppercase">Cycle Length</span>
                                    </div>
                                    <p className="text-sm font-semibold text-purple-800">
                                        {settings.cycleLength} Days
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="space-y-3 pt-2 border-t border-gray-100">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase flex justify-between">
                                    <span>Last Period Start</span>
                                </label>
                                <input 
                                    type="date" 
                                    className="w-full mt-1 p-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-pink-300"
                                    value={settings.lastPeriodDate}
                                    onChange={(e) => updateSettings({ lastPeriodDate: e.target.value })}
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase flex justify-between mb-2">
                                    <span>Cycle Length ({settings.cycleLength} days)</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="21" 
                                    max="35"
                                    className="w-full accent-pink-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    value={settings.cycleLength}
                                    onChange={(e) => updateSettings({ cycleLength: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        
        {/* Collapsed State Hint */}
        {!settings.isPeriodTrackingEnabled && (
            <div className="p-6 text-center text-gray-400 text-sm italic">
                Tracking disabled. Tap the toggle above to enable.
            </div>
        )}
      </div>

      {/* Water Tracker */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-blue-50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 bg-blue-50 transition-all duration-500" style={{ height: `${Math.min((log.waterIntake / 2000) * 100, 100)}%`, opacity: 0.3 }} />
        
        <div className="relative z-10 flex flex-col items-center">
           <h3 className="font-medium text-gray-600 mb-4">Hydration</h3>
           <div className="text-4xl font-bold text-blue-500 mb-2">{log.waterIntake}<span className="text-lg text-gray-400 font-normal">/2000ml</span></div>
           
           <div className="flex items-center gap-6 mt-4">
             <button onClick={() => updateWater(-250)} className="p-3 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"><Minus size={20} /></button>
             <div className="w-24 h-24 relative">
                {/* Simple CSS Cup Animation */}
                <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-200">
                    <span className="text-3xl">💧</span>
                </div>
             </div>
             <button onClick={() => updateWater(250)} className="p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600"><Plus size={20} /></button>
           </div>
        </div>
      </div>

      {/* Mood Tracker */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-700 mb-4">How are you feeling?</h3>
        <div className="flex justify-between gap-2">
            {[MoodType.Happy, MoodType.Calm, MoodType.Tired, MoodType.Sad, MoodType.Anxious].map((m) => {
                const emojis: Record<string, string> = { Happy: '🥰', Calm: '😌', Tired: '😴', Sad: '😢', Anxious: '😰' };
                const isSelected = log.mood === m;
                return (
                    <button 
                        key={m}
                        onClick={() => setMood(m)}
                        className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all ${isSelected ? 'bg-pink-100 scale-110' : 'bg-transparent'}`}
                    >
                        <span className="text-3xl">{emojis[m]}</span>
                        <span className={`text-[10px] font-medium ${isSelected ? 'text-pink-600' : 'text-gray-400'}`}>{m}</span>
                    </button>
                )
            })}
        </div>
        {aiResponse && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-pink-50 rounded-2xl text-pink-600 text-sm italic border border-pink-100"
            >
                "{aiResponse}"
            </motion.div>
        )}
      </div>

      {/* Breathing Exercise */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-3xl p-6 border border-teal-100 text-center">
        <h3 className="font-bold text-teal-800 mb-2">Breathe with me</h3>
        <p className="text-teal-600 text-sm mb-6">Take a moment to center yourself.</p>
        
        <div className="flex justify-center py-4">
            <motion.div
                animate={isBreathing ? {
                    scale: [1, 1.5, 1.5, 1],
                    rotate: [0, 180, 180, 0]
                } : {}}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.4, 0.6, 1]
                }}
                className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center text-teal-300 border-4 border-teal-200/50"
            >
                <span className="text-4xl">🧘🏻‍♀️</span>
            </motion.div>
        </div>

        <button 
            onClick={() => setIsBreathing(!isBreathing)}
            className={`mt-4 px-8 py-2 rounded-full font-medium transition-colors ${isBreathing ? 'bg-teal-200 text-teal-800' : 'bg-teal-500 text-white'}`}
        >
            {isBreathing ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
};