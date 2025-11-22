
import React, { useState } from 'react';
import { ArrowLeft, Save, Lock, Heart, User, Calendar, Moon, Sun, LogOut, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSettings, saveSettings } from '../services/storageService';
import { UserSettings } from '../types';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserSettings>(() => user ? getSettings(user.id) : getSettings(''));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (user) {
        saveSettings(user.id, formData);
        
        // Apply theme immediately
        if (formData.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = () => {
      logout();
      navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="pb-24 px-6 pt-8 max-w-md mx-auto h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
       <div className="flex items-center gap-4 mb-6">
            <Link to="/" className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white font-rounded">App Settings</h1>
       </div>

       <div className="space-y-6">
            
            {/* Appearance Section */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 mb-4">
                    {formData.darkMode ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-orange-400" />} 
                    Appearance
                </h3>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Dark Mode</span>
                    <button 
                        onClick={() => {
                            const newValue = !formData.darkMode;
                            setFormData({...formData, darkMode: newValue});
                            // Apply immediately for preview
                            if (newValue) document.documentElement.classList.add('dark');
                            else document.documentElement.classList.remove('dark');
                        }}
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${formData.darkMode ? 'bg-indigo-500 justify-end' : 'bg-gray-200 dark:bg-gray-600 justify-start'}`}
                    >
                        <motion.div 
                            layout 
                            className="w-6 h-6 bg-white rounded-full shadow-md"
                        />
                    </button>
                </div>
            </section>

            {/* Profile Section */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 mb-4">
                    <User size={18} className="text-pink-500" /> Profile
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Your Name</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mt-1 outline-none border border-transparent focus:border-pink-200 dark:focus:border-pink-500 focus:bg-pink-50 dark:focus:bg-gray-600 transition-colors dark:text-white"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Partner's Name (for Chat)</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mt-1 outline-none border border-transparent focus:border-pink-200 dark:focus:border-pink-500 focus:bg-pink-50 dark:focus:bg-gray-600 transition-colors dark:text-white"
                            value={formData.partnerName}
                            onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Emergency Contact</label>
                        <input 
                            type="tel" 
                            placeholder="911"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mt-1 outline-none border border-transparent focus:border-pink-200 dark:focus:border-pink-500 focus:bg-pink-50 dark:focus:bg-gray-600 transition-colors dark:text-white"
                            value={formData.emergencyContact}
                            onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                        />
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 mb-4">
                    <Lock size={18} className="text-purple-500" /> Security
                </h3>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">App Lock PIN (4 Digits)</label>
                    <input 
                        type="password" 
                        maxLength={4}
                        placeholder="Leave empty to disable"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mt-1 outline-none border border-transparent focus:border-pink-200 dark:focus:border-pink-500 focus:bg-pink-50 dark:focus:bg-gray-600 transition-colors dark:text-white"
                        value={formData.pin}
                        onChange={(e) => setFormData({...formData, pin: e.target.value})}
                    />
                    <p className="text-[10px] text-gray-400 mt-2">
                        If PIN is set, Biometric login (FaceID/Fingerprint) will be enabled automatically on supported devices.
                    </p>
                </div>
            </section>

            {/* Wellness Section */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 mb-4">
                    <Calendar size={18} className="text-rose-500" /> Cycle Settings
                </h3>
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Enable Tracking</span>
                    <button 
                        onClick={() => setFormData({...formData, isPeriodTrackingEnabled: !formData.isPeriodTrackingEnabled})}
                        className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${formData.isPeriodTrackingEnabled ? 'bg-pink-500 justify-end' : 'bg-gray-200 dark:bg-gray-600 justify-start'}`}
                    >
                        <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-md" />
                    </button>
                </div>
                {formData.isPeriodTrackingEnabled && (
                    <div className="space-y-4">
                         <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Cycle Length (Days)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mt-1 outline-none border border-transparent focus:border-pink-200 dark:focus:border-pink-500 focus:bg-pink-50 dark:focus:bg-gray-600 transition-colors dark:text-white"
                                value={formData.cycleLength}
                                onChange={(e) => setFormData({...formData, cycleLength: parseInt(e.target.value) || 28})}
                            />
                        </div>
                    </div>
                )}
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-8">
                <button 
                    onClick={handleSave}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {saved ? 'Settings Saved!' : 'Save Changes'}
                    <Save size={18} />
                </button>

                <button 
                    onClick={handleLogout}
                    className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    Log Out
                    <LogOut size={18} />
                </button>
            </div>
       </div>
    </div>
  );
};
