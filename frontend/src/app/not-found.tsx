'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import errorAnimation from '../../public/404 Error.json';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Dynamically import Lottie to prevent SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '4s' }} />

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Button 
          onClick={() => router.push('/')} 
          variant="ghost" 
          size="icon"
          className="w-14 h-14 rounded-full hover:scale-105 transition-all duration-300 backdrop-blur-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:bg-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.3)' }}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* Content Container (Full Screen) */}
      <div className="relative z-10 w-full px-6 flex flex-col items-center text-center">
        
        {/* Lottie Animation */}
        <div className="w-full max-w-lg md:max-w-xl mx-auto h-[40vh] md:h-[50vh] flex items-center justify-center mb-6">
          <Lottie 
            animationData={errorAnimation} 
            loop={true} 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* Text Container */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-md tracking-tight">
            Oops! Page Not Found
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium">
            We couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>
        
      </div>
    </div>
  );
}
