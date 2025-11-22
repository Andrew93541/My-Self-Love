
import React, { useState, useEffect } from 'react';
import { Image, Plus, Trash2, ArrowLeft, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getMoments, addMoment } from '../services/storageService';
import { Moment } from '../types';

export const Moments: React.FC = () => {
    const { user } = useAuth();
    const [moments, setMoments] = useState<Moment[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newImage, setNewImage] = useState('');
    const [caption, setCaption] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setMoments(getMoments(user.id));
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 800000) { // 800KB limit
                setError("Image is a bit too big for your diary! Try a smaller one.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImage(reader.result as string);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!user || !newImage) return;

        const moment: Moment = {
            id: Date.now().toString(),
            userId: user.id,
            imageUrl: newImage,
            caption: caption || 'A beautiful moment',
            date: Date.now()
        };

        addMoment(user.id, moment);
        setMoments([moment, ...moments]);
        setShowAdd(false);
        setNewImage('');
        setCaption('');
    };

    const handleShare = async (moment: Moment) => {
        if (!navigator.share) {
            alert("Sharing is not supported on this browser/device.");
            return;
        }

        try {
            // Convert Base64 back to a Blob/File for sharing
            const response = await fetch(moment.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], "moment.png", { type: blob.type });

            await navigator.share({
                title: 'MySafeLove Moment',
                text: moment.caption,
                files: [file],
            });
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    return (
        <div className="pb-24 px-6 pt-8 max-w-md mx-auto h-full overflow-y-auto">
             <div className="flex items-center gap-4 mb-6">
                <Link to="/" className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-600 border border-gray-100">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 font-rounded">Our Moments</h1>
                <button 
                    onClick={() => setShowAdd(true)}
                    className="ml-auto bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                    <Plus size={20} />
                </button>
           </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 gap-4">
                {moments.length === 0 ? (
                    <div className="col-span-2 text-center py-20 opacity-50">
                        <Image size={48} className="mx-auto mb-2 text-pink-300" />
                        <p>No memories saved yet.</p>
                    </div>
                ) : (
                    moments.map((moment, index) => (
                        <motion.div 
                            key={moment.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-2 pb-4 rounded-xl shadow-sm border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform relative group"
                        >
                            <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-50 relative">
                                <img src={moment.imageUrl} alt="Memory" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => handleShare(moment)}
                                    className="absolute top-2 right-2 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Share2 size={14} />
                                </button>
                            </div>
                            <p className="text-xs font-medium text-center text-gray-600 px-1 font-handwriting">
                                {moment.caption}
                            </p>
                            <p className="text-[10px] text-center text-gray-300 mt-1">
                                {new Date(moment.date).toLocaleDateString()}
                            </p>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl"
                        >
                            <h2 className="text-xl font-bold mb-4">Add Memory</h2>
                            
                            <div className="mb-4">
                                {newImage ? (
                                    <div className="relative rounded-xl overflow-hidden h-48 mb-2">
                                        <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => setNewImage('')}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                        <Image className="text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500">Tap to upload photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>

                            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

                            <input 
                                type="text"
                                placeholder="Write a cute caption..."
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none mb-4 text-sm"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />

                            <div className="flex gap-3">
                                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium">Cancel</button>
                                <button onClick={handleSave} className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold shadow-lg">Save</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
