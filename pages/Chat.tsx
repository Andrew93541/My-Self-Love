
import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, ArrowLeft, Mic, MicOff, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChatHistory, addChatMessage, getSettings } from '../services/storageService';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';

export const Chat: React.FC = () => {
  const { user, pair } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<any>(null);

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  const loadData = () => {
      if (user) {
        setSettings(getSettings(user.id));
        const history = getChatHistory(user.id);
        // Only scroll if new message count is different
        if (history.length !== messages.length) {
            setMessages(history);
            scrollToBottom();
        }
      }
  };

  useEffect(() => {
    loadData();

    // Listen for partner messages (Simulating Real-time Socket)
    const handleUpdate = (e: Event) => {
        loadData();
    };
    
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('localDataUpdated', handleUpdate);

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript); 
            setIsListening(false);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {
        window.removeEventListener('storage', handleUpdate);
        window.removeEventListener('localDataUpdated', handleUpdate);
    }
  }, [user?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const toggleListening = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    } else {
        recognitionRef.current?.start();
        setIsListening(true);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || !user || !settings) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      text: textToSend,
      sender: 'user',
      timestamp: Date.now(),
      isReal: true
    };

    // Save locally (triggers event for partner if paired)
    addChatMessage(user.id, userMsg);
    setInput('');
    scrollToBottom();

    // If Paired, we don't need AI. The partner will see the message via the storage event.
    if (!pair) {
        // Fallback to AI if single
        setIsTyping(true);
        const historyText = messages.map(m => `${m.sender}: ${m.text}`);
        const aiText = await getChatResponse(userMsg.text, historyText, settings);
        
        setIsTyping(false);
        
        const partnerMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          userId: user.id, // Using user ID but marked as partner sender
          text: aiText,
          sender: 'partner',
          timestamp: Date.now(),
          isReal: false
        };

        addChatMessage(user.id, partnerMsg);
        scrollToBottom();
    }
  };

  if (!settings) return null;

  return (
    <div className="flex flex-col h-full bg-pink-50/50 dark:bg-gray-900 pb-[80px]">
      {/* Chat Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-4 shadow-sm border-b border-pink-100 dark:border-gray-700 flex items-center gap-3 z-20 transition-colors">
        <Link to="/" className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ArrowLeft size={20} />
        </Link>
        <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${pair ? 'bg-gradient-to-tr from-green-400 to-emerald-500' : 'bg-gradient-to-tr from-pink-300 to-purple-300'}`}>
                {pair ? <Users size={18} /> : settings.partnerName.charAt(0)}
            </div>
            {pair && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></div>}
        </div>
        <div>
            <h2 className="font-bold text-gray-800 dark:text-white">
                {pair ? (user?.role === 'protected' ? 'My Protector' : 'My Love') : `${settings.partnerName} (AI)`}
            </h2>
            <p className="text-xs text-pink-500 flex items-center gap-1">
                {pair ? 'Connected • Live' : 'Digital Companion'}
            </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
                <Heart className="w-12 h-12 mx-auto text-pink-200 mb-2" />
                <p>Start chatting...</p>
            </div>
        )}
        
        {messages.map((msg) => {
            const isMe = msg.userId === user?.id && msg.sender === 'user';
            
            return (
                <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${isMe 
                            ? 'bg-pink-500 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                        }`}
                    >
                        {msg.text}
                    </div>
                </motion.div>
            )
        })}
        {isTyping && (
             <div className="flex justify-start">
                 <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-200"></span>
                 </div>
             </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-pink-100 dark:border-gray-700 z-20 transition-colors">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-full border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-pink-200 focus-within:border-pink-300 transition-all">
            <button 
                onClick={toggleListening}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-pink-500'}`}
            >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Type a message..."}
                className="flex-1 bg-transparent px-2 py-2 outline-none text-gray-700 dark:text-gray-100 placeholder-gray-400"
            />
            <button 
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-600 active:scale-95 transition-transform"
            >
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};
