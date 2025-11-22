
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Copy, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPairingCode, joinPair } from '../services/storageService';

export const Pairing: React.FC = () => {
    const { user, refreshPair, pair } = useAuth();
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Redirect if already paired
    useEffect(() => {
        if (pair) {
            navigate('/');
        }
    }, [pair, navigate]);

    const handleCreateCode = () => {
        if (user) {
            const newCode = createPairingCode(user.id);
            setCode(newCode);
        }
    };

    const handleJoin = () => {
        if (user && inputCode.length === 6) {
            const success = joinPair(user.id, inputCode.toUpperCase());
            if (success) {
                refreshPair();
                navigate('/'); // Will redirect to dashboard
            } else {
                setError('Invalid code or session already full.');
            }
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-sm"
            >
                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white shadow-lg">
                        {user.role === 'protected' ? <Heart size={32} /> : <Shield size={32} />}
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Hearts</h1>
                <p className="text-gray-500 text-sm mb-8">
                    Link your app with your partner to enable live chat, location safety, and shared moments.
                </p>

                {/* Generate Code Section */}
                {!code ? (
                    <div className="space-y-6">
                        <button 
                            onClick={handleCreateCode}
                            className="w-full bg-pink-100 text-pink-600 py-4 rounded-xl font-bold border border-pink-200 hover:bg-pink-200 transition-colors"
                        >
                            Generate Pairing Code
                        </button>
                        
                        <div className="relative flex items-center gap-2">
                            <div className="h-[1px] bg-gray-200 flex-1"></div>
                            <span className="text-gray-400 text-xs uppercase font-bold">OR</span>
                            <div className="h-[1px] bg-gray-200 flex-1"></div>
                        </div>

                        <div>
                            <input 
                                type="text" 
                                placeholder="Enter Partner's Code"
                                maxLength={6}
                                className="w-full text-center text-2xl tracking-widest font-mono uppercase bg-gray-50 border border-gray-200 rounded-xl py-3 outline-none focus:ring-2 focus:ring-pink-300 mb-2"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                            />
                            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
                            <button 
                                onClick={handleJoin}
                                disabled={inputCode.length !== 6}
                                className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:shadow-none mt-2"
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-pink-50 p-6 rounded-2xl border-2 border-dashed border-pink-200">
                            <p className="text-xs text-gray-500 mb-2 uppercase font-bold">Share this code</p>
                            <h2 className="text-4xl font-mono font-bold text-gray-800 tracking-widest mb-4">{code}</h2>
                            <button 
                                onClick={copyToClipboard}
                                className="flex items-center justify-center gap-2 w-full py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-600 hover:text-pink-500"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy Code'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 animate-pulse">Waiting for partner to connect...</p>
                        <button onClick={() => setCode('')} className="text-sm text-gray-400 underline">Cancel</button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
