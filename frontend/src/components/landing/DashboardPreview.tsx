"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Activity, Mic, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const images = [
  '/in1.jpg',
  '/in2.png',
  '/in3.png',
  '/in4.png'
];

const matchScores = [85, 92, 78, 96];
const confidenceLevels = ["High", "Optimal", "Good", "Excellent"];
const experienceMatches = [
  "React Experience Match",
  "Node.js Backend Match",
  "System Design Ready",
  "Cloud Architecture Fit"
];

const Panel = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <div
    className={cn("bg-card border border-border p-4", className)}
  >
    {children}
  </div>
);

export function DashboardPreview() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentScore = matchScores[currentIndex];
  const currentConfidence = confidenceLevels[currentIndex];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-foreground">
            Experience the <span className="text-primary">Dashboard</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A unified, premium interface providing real-time feedback during your interview simulations.
          </p>
        </div>

        {/* Dashboard Mockup Container */}
        <div className="relative w-full max-w-5xl mx-auto rounded-3xl p-4 md:p-8 bg-card border border-border shadow-2xl">
          
          <div className="flex items-center gap-2 mb-6 px-2">
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 h-auto md:h-[600px]">
            
            {/* Main Video Call Area (Center) */}
            <Panel className="md:col-span-8 md:row-span-2 relative overflow-hidden rounded-2xl bg-background p-0" delay={0.1}>
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full z-20 border border-border backdrop-blur-md">
                <Video className="w-4 h-4 text-foreground" />
                <span className="text-xs text-foreground font-medium">AI Interviewer Active</span>
              </div>
              
              <div className="relative w-full h-full min-h-[300px] md:min-h-full rounded-xl overflow-hidden border border-border bg-muted">
                {images.map((src, idx) => (
                  <Image
                    key={src}
                    src={src}
                    alt={`AI Interviewer ${idx}`}
                    fill
                    className={cn(
                      "object-cover transition-opacity duration-[1500ms] ease-in-out",
                      idx === currentIndex ? "opacity-100" : "opacity-0"
                    )}
                    priority={true}
                  />
                ))}
              </div>
            </Panel>

            {/* AI Analysis (Right Top) */}
            <Panel className="md:col-span-4 rounded-2xl bg-background" delay={0.2}>
              <div className="flex items-center gap-2 text-foreground mb-4">
                <FileText className="w-4 h-4" />
                <h4 className="font-semibold text-sm">Resume Match</h4>
              </div>
              
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                <motion.div 
                  className="h-full bg-primary rounded-full" 
                  initial={false}
                  animate={{ width: `${currentScore}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground mb-6">
                <span>Alignment</span>
                <span className="text-foreground font-bold">{currentScore}%</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="transition-all duration-300">
                    {experienceMatches[currentIndex]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="transition-all duration-300">
                    {experienceMatches[(currentIndex + 1) % 4]}
                  </span>
                </div>
              </div>
            </Panel>

            {/* Metrics (Right Bottom) */}
            <Panel className="md:col-span-4 rounded-2xl bg-background" delay={0.3}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-foreground">
                  <Activity className="w-4 h-4" />
                  <h4 className="font-semibold text-sm">Confidence Level</h4>
                </div>
                <span className="text-xl font-bold font-heading text-primary transition-all duration-300">
                  {currentConfidence}
                </span>
              </div>
              
              {/* Fake Audio Waveform */}
              <div className="flex items-end gap-1 h-12 w-full justify-center opacity-50 mb-4">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={`${currentIndex}-${i}`} // Force re-render animation jump on index change
                    initial={{ height: '20%' }}
                    animate={{ height: ['20%', `${Math.random() * 80 + 20}%`, '40%', '100%', '20%'] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: 'easeInOut'
                    }}
                    className="w-1.5 bg-foreground rounded-full"
                  />
                ))}
              </div>
              <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
                <Mic className="w-3 h-3" />
                <span>Voice clarity optimal</span>
              </div>
            </Panel>
          </div>

        </div>
      </div>
    </section>
  );
}
