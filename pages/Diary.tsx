
import React, { useState, useEffect } from 'react';
import { Book, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getDiaryEntries, addDiaryEntry } from '../services/storageService';
import { DiaryEntry, MoodType } from '../types';

export const Diary: React.FC = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<MoodType>(MoodType.Calm);

    useEffect(() => {
        if (user) {
            setEntries(getDiaryEntries(user.id));
        }
    }, [user]);

    const handleSave = () => {
        if (!user || !newContent.trim()) return;

        const entry: DiaryEntry = {
            id: Date.now().toString(),
            userId: user.id,
            date: Date.now(),
            title: newTitle || 'Untitled Thought',
            content: newContent,
            mood: selectedMood
        };

        addDiaryEntry(user.id, entry);
        setEntries([entry, ...entries]);
        setIsWriting(false);
        setNewTitle('');
        setNewContent('');
    };

    return (
        <div className="pb-24 px-6 pt-8 max-w-md mx-auto h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 font-rounded">Heart Notes</h1>
                <button 
                    onClick={() => setIsWriting(true)}
                    className="bg-pink-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 hover:bg-pink-600 transition-colors"
                >
                    <Plus size={16} /> Write
                </button>
            </div>

            <div className="space-y-4">
                {entries.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Book size={48} className="mx-auto mb-2 text-pink-300" />
                        <p>Your heart is empty pages waiting to be filled.</p>
                    </div>
                ) : (
                    entries.map(entry => (
                        <div key={entry.id} className="bg-white p-5 rounded-3xl shadow-sm border border-pink-50 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-pink-100 to-transparent rounded-bl-full -mr-8 -mt-8"></div>
                             <p className="text-xs text-gray-400 mb-1">{new Date(entry.date).toLocaleDateString()} • {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                             <h3 className="font-bold text-gray-800 mb-2">{entry.title}</h3>
                             <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                             <div className="mt-3 flex gap-2">
                                <span className="text-xs bg-pink-50 text-pink-500 px-2 py-1 rounded-lg border border-pink-100">
                                    Mood: {entry.mood}
                                </span>
                             </div>
                        </div>
                    ))
                )}
            </div>

            {/* Writing Modal */}
            <AnimatePresence>
                {isWriting && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/90 backdrop-blur-lg z-50 p-6 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">New Entry</h2>
                            <button onClick={() => setIsWriting(false)} className="p-2 bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <input 
                            type="text" 
                            placeholder="Title (Optional)"
                            className="text-xl font-bold text-gray-800 bg-transparent outline-none mb-4 placeholder-gray-300"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />

                        <textarea 
                            placeholder="Pour your heart out..."
                            className="flex-1 bg-transparent outline-none text-gray-600 leading-relaxed resize-none text-base placeholder-gray-300"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                        />

                        <div className="mt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Current Mood</p>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {[MoodType.Happy, MoodType.Calm, MoodType.Sad, MoodType.Anxious].map(mood => (
                                    <button 
                                        key={mood}
                                        onClick={() => setSelectedMood(mood)}
                                        className={`px-3 py-1 rounded-full text-xs border ${selectedMood === mood ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        {mood}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleSave}
                            className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold shadow-lg mt-4"
                        >
                            Save Entry
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
