
import React, { useState, useEffect } from 'react';
import { Phone, MapPin, AlertTriangle, Video, Navigation, Search, ExternalLink, Battery, Shield, Stethoscope, Siren } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSettings, updateLocation, getPartnerLocation, getPartnerId } from '../services/storageService';
import { findNearbyPlaces } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { useAuth } from '../context/AuthContext';
import { LocationData } from '../types';

export const Emergency: React.FC = () => {
  const { user, pair } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [partnerLoc, setPartnerLoc] = useState<LocationData | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [sosActive, setSosActive] = useState(false);
  const [nearbyResults, setNearbyResults] = useState<any[]>([]);
  const [searchingType, setSearchingType] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const settings = user ? getSettings(user.id) : getSettings('');
  const isProtector = user?.role === 'protector';
  
  // Get contact number (For girl: boyfriend/911. For boy: girlfriend's number)
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
            // Helper to get ID agnostic of role
            const partnerId = getPartnerId(user.id);
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
    audioService.playSiren(); // Trigger sound
    
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

  const searchNearby = async (type: string) => {
      if (!location) {
          alert("Getting your location... Please wait a moment.");
          return;
      }
      
      setSearchingType(type);
      setNearbyResults([]);
      setHasSearched(false);
      
      try {
          const response = await findNearbyPlaces(location.latitude, location.longitude, type);
          if (response?.candidates?.[0]?.groundingMetadata?.groundingChunks) {
              setNearbyResults(response.candidates[0].groundingMetadata.groundingChunks);
          }
          setHasSearched(true);
      } catch (e) {
          console.error(e);
          alert("Failed to find places. Please check your connection.");
      } finally {
          setSearchingType(null);
      }
  };

  return (
    <div className="pb-24 px-6 pt-12 max-w-md mx-auto h-full flex flex-col items-center relative overflow-y-auto">
      {isProtector ? (
        <>
            <div className="mb-6 text-center">
                 <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-rounded mb-2">Safety Monitor</h1>
                 <p className="text-gray-500 dark:text-gray-400 text-sm">Live status of your protected partner</p>
            </div>
            
            {/* Protector Map View (Prominent) */}
            <div className="w-full bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-lg border border-blue-100 dark:border-gray-700 mb-6 relative group">
                 <div className="h-72 rounded-2xl bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                    {partnerLoc ? (
                        <>
                            <iframe 
                                title="Partner Location"
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                src={`https://maps.google.com/maps?q=${partnerLoc.latitude},${partnerLoc.longitude}&z=15&output=embed`}
                            ></iframe>
                            {/* Interactive Overlay for clicking */}
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${partnerLoc.latitude},${partnerLoc.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 z-10 bg-transparent"
                                title="Tap to open in Maps"
                            />
                             <div className="absolute bottom-2 right-2 z-20 pointer-events-none">
                                <span className="bg-white/90 dark:bg-gray-800/90 text-xs px-2 py-1 rounded-md shadow-sm text-gray-600 dark:text-gray-300 font-bold">
                                    Tap to Navigate
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Shield size={48} className="mb-2 opacity-50" />
                            <p className="text-sm font-medium">Waiting for signal...</p>
                        </div>
                    )}
                 </div>
                 
                 {/* Status Indicators */}
                 <div className="flex justify-between items-center mt-3 px-2">
                    <div className="flex items-center gap-2">
                         <div className={`w-3 h-3 rounded-full ${partnerLoc ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                         <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                            {partnerLoc ? "Signal Active" : "Offline"}
                         </span>
                    </div>
                    {partnerLoc && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <Battery size={16} className={partnerLoc.batteryLevel && partnerLoc.batteryLevel < 20 ? "text-red-500" : "text-green-500"} />
                            <span className="text-xs font-bold">{partnerLoc.batteryLevel || 85}%</span>
                        </div>
                    )}
                 </div>
            </div>
            
            {/* Protector Actions */}
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
                 <a href={`tel:${contactNumber}`} className="bg-green-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform">
                    <Phone size={24} className="mb-2" />
                    <span className="font-bold">Call Her</span>
                 </a>
                  <button 
                    onClick={() => {
                        if(partnerLoc) window.open(`https://www.google.com/maps/search/?api=1&query=${partnerLoc.latitude},${partnerLoc.longitude}`, '_blank');
                    }}
                    className="bg-blue-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
                  >
                    <Navigation size={24} className="mb-2" />
                    <span className="font-bold">Navigate</span>
                 </button>
            </div>
        </>
      ) : (
        <>
            {/* GIRL VIEW - SOS FOCUS */}
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
            
            {/* Nearby Places for Girl */}
             <div className="w-full mb-6">
                <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-3 flex items-center gap-2">
                    <MapPin size={18} /> Nearby Safe Havens
                </h3>
                <p className="text-xs text-gray-400 mb-3">Powered by Google Maps real-time data</p>
                <div className="flex gap-3 mb-4">
                    <button 
                        onClick={() => searchNearby('Hospitals')}
                        disabled={searchingType !== null}
                        className="flex-1 bg-white dark:bg-gray-800 py-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                    >
                        {searchingType === 'Hospitals' ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Stethoscope size={16} className="text-red-500" />
                                <span>Hospitals</span>
                            </>
                        )}
                    </button>
                    <button 
                        onClick={() => searchNearby('Police Stations')}
                        disabled={searchingType !== null}
                        className="flex-1 bg-white dark:bg-gray-800 py-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                    >
                         {searchingType === 'Police Stations' ? (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Siren size={16} className="text-blue-500" />
                                <span>Police</span>
                            </>
                        )}
                    </button>
                </div>
                 <AnimatePresence>
                    {nearbyResults.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 overflow-hidden pb-4"
                        >
                            {nearbyResults.map((chunk, index) => {
                                const web = chunk.web;
                                const maps = (web?.uri && web.uri.includes('google.com/maps')) || chunk.maps; 
                                if (!web && !maps) return null;

                                // Clean Title
                                const rawTitle = web?.title || "Unknown Location";
                                const title = rawTitle.replace(' - Google Maps', '').trim();
                                const isHospital = title.toLowerCase().includes('hospital') || title.toLowerCase().includes('medical') || title.toLowerCase().includes('clinic');
                                const Icon = isHospital ? Stethoscope : Siren;
                                const iconColor = isHospital ? 'text-red-500' : 'text-blue-500';

                                return (
                                    <div 
                                        key={index} 
                                        className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`bg-gray-50 dark:bg-gray-700 p-3 rounded-full ${iconColor} mt-1`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-1">
                                                    {title}
                                                </h4>
                                                {/* If no snippet, assume generic description */}
                                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                    {/* Grounding chunks usually don't have clean address fields, so we rely on navigation */}
                                                    Tap Navigate to see address and directions.
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <a 
                                            href={web?.uri || '#'} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${isHospital ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'}`}
                                        >
                                            <Navigation size={16} />
                                            Navigate
                                        </a>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                    {hasSearched && nearbyResults.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-6 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"
                        >
                            <p>No results found nearby.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
      )}

      {/* My Location Footer */}
      <div className="mt-4 flex items-center gap-2 text-gray-400 text-xs bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
        <Navigation size={12} />
        <span>My Loc: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Acquiring...'}</span>
      </div>
    </div>
  );
};
