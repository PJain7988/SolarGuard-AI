import React, { useState } from 'react';
import { Shield, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin@solarguard.ai');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('https://solarguard-ai-7gw9.onrender.com/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        onLogin();
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-card/60 backdrop-blur-xl border rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-2xl mb-4 border border-primary/20 shadow-inner">
            <Shield size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            SolarGuard AI
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Enterprise Authentication</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wide uppercase text-muted-foreground ml-1">Work Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <User size={18} />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@solarguard.ai"
                className="w-full bg-background border border-border/50 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium shadow-sm transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wide uppercase text-muted-foreground ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border/50 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium shadow-sm transition-all"
                required
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-destructive text-sm font-bold bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold mt-2 flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/30 transform transition hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Authenticate <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
        
        <p className="text-center text-xs text-muted-foreground mt-8 font-medium">
          Protected by AES-256 Encryption & Zero-Trust Architecture
        </p>
      </motion.div>
    </div>
  );
}
