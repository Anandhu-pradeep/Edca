"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register'>(initialView);

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  // Clip-path states for the overlay
  // Left state: polygon covering the left side (Login View)
  const leftClip = "polygon(0% 0%, 55% 0%, 35% 100%, 0% 100%)";
  // Mid state: straight vertical rectangle in the center
  const midClip = "polygon(25% 0%, 75% 0%, 75% 100%, 25% 100%)";
  // Right state: polygon covering the right side (Register View) - backslash angle \
  const rightClip = "polygon(45% 0%, 100% 0%, 100% 100%, 65% 100%)";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[900px] h-[650px] md:h-[550px] bg-[#e0f2fe] dark:bg-card rounded-2xl overflow-hidden border border-primary shadow-2xl flex"
        >
          {/* Close Button (Global) */}
          <button 
            onClick={onClose}
            className={`absolute top-4 right-4 z-[200] p-2 transition-colors rounded-full ${view === 'register' ? 'text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/10' : 'text-foreground/50 hover:text-foreground hover:bg-foreground/10'}`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* BACKGROUND FORMS (Static layout, opacity fades based on view) */}
          
          {/* Left Side: Register Form (Visible when view === 'register', i.e. overlay is on right) */}
          <div className="absolute top-0 left-0 w-[45%] h-full flex flex-col justify-center px-12 py-8 z-0">
            <AnimatePresence mode="wait">
              {view === 'register' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h3 className="text-3xl font-bold text-foreground mb-8 text-center">Register</h3>
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Username</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Enter your username"
                          className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 outline-none transition-colors placeholder:text-foreground/30"
                        />
                        <User className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Email</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          placeholder="Enter your email"
                          className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 outline-none transition-colors placeholder:text-foreground/30"
                        />
                        <Mail className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Password</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          placeholder="Enter your password"
                          className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 outline-none transition-colors placeholder:text-foreground/30"
                        />
                        <Lock className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full py-6 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 hover:scale-[1.02] transition-all"
                    >
                      Register
                    </Button>
                  </form>
                  
                  {/* Social Logins */}
                  <div className="mt-8">
                    <div className="relative flex items-center mb-6">
                      <div className="flex-grow border-t border-border"></div>
                      <span className="flex-shrink-0 px-4 text-muted-foreground text-xs">OR</span>
                      <div className="flex-grow border-t border-border"></div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="w-full">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" className="w-full">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        GitHub
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Sign In Form (Visible when view === 'login', i.e. overlay is on left) */}
          <div className="absolute top-0 right-0 w-[45%] h-full flex flex-col justify-center px-12 py-8 z-0">
            <AnimatePresence mode="wait">
              {view === 'login' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h3 className="text-3xl font-bold text-foreground mb-8 text-center">Log In</h3>
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Email</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          placeholder="Enter your email"
                          className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 outline-none transition-colors placeholder:text-foreground/30"
                        />
                        <Mail className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Password</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          placeholder="Enter your password"
                          className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 outline-none transition-colors placeholder:text-foreground/30"
                        />
                        <Lock className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full py-6 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 hover:scale-[1.02] transition-all"
                    >
                      Log In
                    </Button>
                  </form>
                  
                  {/* Social Logins */}
                  <div className="mt-8">
                    <div className="relative flex items-center mb-6">
                      <div className="flex-grow border-t border-border"></div>
                      <span className="flex-shrink-0 px-4 text-muted-foreground text-xs">OR</span>
                      <div className="flex-grow border-t border-border"></div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="w-full">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" className="w-full">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        GitHub
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOREGROUND OVERLAY (Slides left and right by animating clip-path) */}
          <motion.div 
            className="absolute inset-0 bg-primary z-50 pointer-events-none flex"
            initial={false}
            animate={{ clipPath: view === 'login' ? [null, midClip, leftClip] : [null, midClip, rightClip] }}
            transition={{ duration: 0.8, times: [0, 0.5, 1], ease: "easeInOut" }}
          >
            {/* The content inside the overlay is positioned absolutely so it stays inside the visible cut */}
            
            {/* Overlay Content when on LEFT (View === 'login') */}
            <AnimatePresence mode="wait">
              {view === 'login' && (
                <motion.div 
                  key="login-overlay"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-0 left-0 w-[45%] h-full flex flex-col justify-center px-12 text-primary-foreground pointer-events-auto"
                >
                  <h2 className="text-4xl font-bold font-heading mb-4 uppercase tracking-wider">Welcome!</h2>
                  <p className="text-sm opacity-90 leading-relaxed mb-8">
                    We're delighted to have you here. If you need any assistance, feel free to reach out.
                  </p>
                  <div className="text-center">
                    <p className="text-sm opacity-80 mb-2">Don't have an account?</p>
                    <button 
                      onClick={() => setView('register')}
                      className="border-2 border-primary-foreground hover:bg-primary-foreground hover:text-primary text-primary-foreground rounded-full px-8 py-2 font-semibold transition-all"
                    >
                      Register
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Overlay Content when on RIGHT (View === 'register') */}
            <AnimatePresence mode="wait">
              {view === 'register' && (
                <motion.div 
                  key="register-overlay"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-0 right-0 w-[45%] h-full flex flex-col justify-center px-12 text-primary-foreground pointer-events-auto"
                >
                  <h2 className="text-4xl font-bold font-heading mb-4 uppercase tracking-wider text-right">Hello!</h2>
                  <p className="text-sm opacity-90 leading-relaxed mb-8 text-right">
                    Register with your personal details to begin your journey with us.
                  </p>
                  <div className="text-center">
                    <p className="text-sm opacity-80 mb-2">Already have an account?</p>
                    <button 
                      onClick={() => setView('login')}
                      className="border-2 border-primary-foreground hover:bg-primary-foreground hover:text-primary text-primary-foreground rounded-full px-8 py-2 font-semibold transition-all"
                    >
                      Log In
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
