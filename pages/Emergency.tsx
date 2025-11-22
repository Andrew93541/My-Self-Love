
import React, { useState, useEffect } from 'react';
import { Phone, MapPin, AlertTriangle, Video, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSettings, updateLocation, getPartnerLocation } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { LocationData } from '../types';

export const Emergency: React.FC = () => {
  const { user, pair } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [partnerLoc, setPartnerLoc] = useState<LocationData | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [sosActive, setSosActive] = useState(false);
  const settings = user ? getSettings(user.id) : getSettings('');
  const contactNumber = settings.emergencyContact || "911";

  // Location Tracking & Syncing
  useEffect(() => {
    if (!user) return;

    // 1. Get Own Location & Broadcast
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation(pos.coords);
        if (pair) {
            // Simulate sending to cloud
            updateLocation(user.id, pos.coords.latitude, pos.coords.longitude);
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    // 2. Poll/Listen for Partner Location
    const checkPartnerLoc = () => {
        if (pair) {
            const partnerId = pair.userA === user.id ? pair.userB : pair.userA;
            if (partnerId) {
                const loc = getPartnerLocation(partnerId);
                setPartnerLoc(loc);
            }
        }
    };

    const interval = setInterval(checkPartnerLoc, 5000); // Check every 5s
    checkPartnerLoc(); // Initial check
    
    // Also listen for immediate updates via event
    const handleUpdate = () => checkPartnerLoc();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('localDataUpdated', handleUpdate);

    return () => {
        navigator.geolocation.clearWatch(watchId);
        clearInterval(interval);
        window.removeEventListener('storage', handleUpdate);
        window.removeEventListener('localDataUpdated', handleUpdate);
    };
  }, [user, pair]);

  const handleSOS = () => {
    if (sosActive) return;
    setSosActive(true);
    
    let count = 3;
    setCountdown(count);
    
    const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
            clearInterval(timer);
            triggerAlert();
        }
    }, 1000);
  };

  const triggerAlert = () => {
    setIsSending(true);
    const lat = location?.latitude || 0;
    const lng = location?.longitude || 0;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const message = encodeURIComponent(`HELP! I need help. My location: ${mapLink}`);
    window.location.href = `sms:${contactNumber}?body=${message}`;
    
    setTimeout(() => {
        setIsSending(false);
        setSosActive(false);
    }, 5000);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setCountdown(3);
    setIsSending(false);
  };

  return (
    <div className="pb-24 px-6 pt-12 max-w-md mx-auto h-full flex flex-col items-center relative overflow-y-auto">
      <h1 className="text-3xl font-bold text-red-500 font-rounded mb-2">Emergency</h1>
      <p className="text-gray-500 mb-8 text-center">Tap and hold SOS to alert emergency contacts</p>

      {/* SOS Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSOS}
        className={`w-48 h-48 rounded-full shadow-2xl flex flex-col items-center justify-center border-8 transition-colors duration-500 relative overflow-hidden mb-8 ${sosActive ? 'bg-red-600 border-red-200' : 'bg-white border-red-100'}`}
      >
        {sosActive ? (
            <motion.div 
                className="absolute inset-0 bg-red-500 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
            >
                 <span className="text-6xl font-bold text-white">{countdown > 0 ? countdown : 'SENT'}</span>
            </motion.div>
        ) : (
            <>
                <AlertTriangle size={48} className="text-red-500 mb-2" />
                <span className="text-xl font-bold text-gray-700">SOS</span>
            </>
        )}
      </motion.button>
      
      {sosActive && countdown > 0 && (
          <button onClick={cancelSOS} className="mb-8 text-gray-500 underline">Cancel Alert</button>
      )}

      {/* Map / Partner Location Section */}
      <div className="w-full bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
            {partnerLoc ? (
                 <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${partnerLoc.longitude-0.01}%2C${partnerLoc.latitude-0.01}%2C${partnerLoc.longitude+0.01}%2C${partnerLoc.latitude+0.01}&layer=mapnik&marker=${partnerLoc.latitude}%2C${partnerLoc.longitude}`}
                 ></iframe>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MapPin size={32} className="mb-2" />
                    <p className="text-xs">
                        {pair ? "Waiting for partner location..." : "Pair devices to see location"}
                    </p>
                </div>
            )}
            
            {/* Status Overlay */}
            <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-black/50 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-200">
                    {partnerLoc ? "Partner Live" : "Scanning..."}
                </span>
            </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <a href={`tel:${contactNumber}`} className="bg-green-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Phone size={24} className="mb-2" />
            <span className="font-bold">Call</span>
        </a>
        <button className="bg-blue-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Video size={24} className="mb-2" />
            <span className="font-bold">Stream</span>
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-gray-400 text-xs bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
        <Navigation size={12} />
        <span>My Loc: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Acquiring...'}</span>
      </div>
    </div>
  );
};
