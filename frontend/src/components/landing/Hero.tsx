  "use client";

import { motion } from 'framer-motion';
import { ArrowRight, Play, Briefcase, Code, Presentation, Calculator, UserCheck, Activity, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SplineScene } from '@/components/ui/splite';
import { FloatingStats } from './FloatingStats';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FloatingFrame = ({ children, className, delay = 0, duration = 10 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: [0.3, 0.6, 0.3], y: [-20, 20, -20] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    className={cn("absolute glass-panel px-4 py-2 flex items-center gap-2 text-sm font-medium text-primary-text/60 backdrop-blur-sm z-0 blur-[1px] hover:blur-none transition-all cursor-default", className)}
  >
    {children}
  </motion.div>
);

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center justify-center">
      {/* Removed heavy glow background for scroll performance */}
      <div className="absolute inset-0 bg-background overflow-hidden z-0 pointer-events-none" />

      {/* Spline 3D Robot Background (Interactive on whole page, positioned right) */}
      <div className="absolute top-0 bottom-0 left-0 w-[100%] md:w-[120%] lg:w-[150%] z-0 flex items-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full"
        >
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full pointer-events-none md:pointer-events-auto"
          />
        </motion.div>
      </div>

      {/* Foreground Content Overlay */}
      <div className="container mx-auto px-6 max-w-7xl relative z-10 h-full flex flex-col justify-center pointer-events-none">
        
        <div className="w-full lg:w-[55%] pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full text-transparent font-semibold text-sm mb-6 border border-transparent select-none invisible">
              ✨ The Future of Interview Preparation
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight mb-6 text-foreground tracking-tight drop-shadow-sm">
              Ace Every <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground drop-shadow-sm">
                Interview with AI
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed drop-shadow-sm font-medium">
              Practice realistic interviews using AI-powered resume intelligence, confidence analysis, personalized job-role assessments and an immersive interview experience.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-start gap-4 mb-16 pointer-events-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 rounded-full px-8 text-base bg-primary hover:opacity-90 text-primary-foreground shadow-lg group transition-colors"
                onClick={() => router.push('/sign?view=register')}
              >
                Start Practicing
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

            </div>
            
            {/* Animated Statistics (No overlays) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              {[
                { value: "25K+", label: "Interviews" },
                { value: "150+", label: "Job Roles" },
                { value: "500+", label: "Organizations" },
                { value: "92%", label: "Success Rate" },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="py-2"
                >
                  <div className="text-3xl font-bold text-foreground font-heading">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-semibold mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
