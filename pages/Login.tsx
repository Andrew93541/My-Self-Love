
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Lock, Mail, User as UserIcon, ArrowRight, Shield } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('protected');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await authService.login(email, password);
        login(user);
        navigate('/');
      } else {
        const user = await authService.signup(name, email, password, role);
        login(user);
        // Direct to pairing screen if new signup
        navigate('/pairing');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-pink-200 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-50"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-sm z-10 border border-white"
      >
        <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white shadow-lg mb-4">
                <Heart size={32} fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 font-rounded">MySafeLove</h1>
            <p className="text-sm text-gray-500">Your digital guardian & companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Your Name"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 outline-none focus:ring-2 focus:ring-pink-200"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={!isLogin}
                        />
                    </div>
                    {/* Role Selection */}
                    <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                        <button 
                            type="button"
                            onClick={() => setRole('protected')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${role === 'protected' ? 'bg-pink-100 text-pink-600' : 'text-gray-400'}`}
                        >
                            <Heart size={14} /> The Protected
                        </button>
                        <button 
                             type="button"
                            onClick={() => setRole('protector')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${role === 'protector' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                        >
                            <Shield size={14} /> The Protector
                        </button>
                    </div>
                </>
            )}
            
            <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                    type="email" 
                    placeholder="Email Address"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 outline-none focus:ring-2 focus:ring-pink-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                    type="password" 
                    placeholder="Password"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 outline-none focus:ring-2 focus:ring-pink-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                {!loading && <ArrowRight size={18} />}
            </button>
        </form>

        <div className="mt-6 text-center">
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-500 hover:text-pink-600 transition-colors"
            >
                {isLogin ? "New here? Create an account" : "Already have an account? Sign In"}
            </button>
        </div>
      </motion.div>
    </div>
  );
};
