"use client";

import { motion } from 'framer-motion';
import { Terminal, Code, Cpu, Target, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

const GlitchCard = ({ delay, icon: Icon, title, value, className, color }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`absolute glass-panel p-4 flex items-center gap-4 border-l-4 ${className}`}
      style={{ borderLeftColor: color }}
    >
      <div className="w-10 h-10 bg-surface border border-white/10 flex items-center justify-center shadow-inner">
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="text-[10px] text-secondary-text font-heading uppercase tracking-widest">{title}</div>
        <div className="text-sm font-heading font-bold text-primary-text">{value}</div>
      </div>
    </motion.div>
  );
};

export default function HeroSection() {
  const [text, setText] = useState("");
  const fullText = "> Prepare.\n> Practice.\n> Perform.";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center bg-background border-b border-primary/20">
      
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-50" />
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 border border-primary bg-primary/5 mb-8"
            >
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs font-heading font-bold text-primary tracking-widest uppercase">System v2.0 Online</span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-heading font-bold leading-[1.2] tracking-tight mb-6 text-primary-text whitespace-pre-line h-[240px] md:h-[200px]">
              {text}<span className="animate-pulse text-primary">_</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-base text-secondary-text mb-10 max-w-xl font-heading leading-relaxed uppercase tracking-widest border-l-2 border-secondary pl-4"
            >
              Initialize AI-powered mock interviews. Upload data profile (resume) to generate precise simulation parameters.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="flex flex-wrap items-center gap-4 font-heading"
            >
              <button className="h-12 px-8 bg-primary/10 border border-primary text-primary font-bold tracking-widest uppercase hover:bg-primary hover:text-background transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_30px_rgba(57,255,20,0.6)]">
                [ Execute Simulation ]
              </button>
              <button className="h-12 px-8 border border-white/20 bg-surface/50 text-primary-text font-bold tracking-widest uppercase hover:border-accent-cyan hover:text-accent-cyan transition-all">
                View_Logs()
              </button>
            </motion.div>
          </div>

          {/* Right Visuals */}
          <div className="relative h-[600px] hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute inset-0 bg-surface border border-accent-cyan/40 shadow-[0_0_40px_rgba(0,255,255,0.1)] overflow-hidden flex flex-col p-1"
            >
              {/* Terminal Header */}
              <div className="h-8 border-b border-accent-cyan/40 flex items-center px-4 justify-between bg-accent-cyan/10">
                <div className="text-[10px] font-heading text-accent-cyan tracking-widest uppercase">root@career-edge:~# htop</div>
                <div className="flex gap-2">
                   <div className="w-2 h-2 bg-primary" />
                   <div className="w-2 h-2 bg-secondary" />
                   <div className="w-2 h-2 bg-white" />
                </div>
              </div>
              
              {/* Terminal Content */}
              <div className="flex-1 p-6 relative bg-background font-heading text-xs text-primary-text overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(0,255,255,1)_0%,transparent_70%)]" />
                 
                 <p className="text-secondary mb-2">&gt; run facial_analysis.sh</p>
                 <p className="text-secondary-text mb-1">[ OK ] Calibrating webcam sensors...</p>
                 <p className="text-secondary-text mb-4">[ OK ] Tracking points identified: 68</p>
                 
                 <div className="w-48 h-48 border border-primary/50 relative mx-auto my-8 flex items-center justify-center">
                   <div className="absolute inset-0 bg-primary/5" />
                   <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                   <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                   <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                   <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                   
                   <Eye className="w-16 h-16 text-primary animate-pulse" />
                   
                   <div className="absolute -right-24 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                     <span className="text-[10px] text-primary">SYNC: 99.9%</span>
                     <span className="text-[10px] text-accent-cyan">CONF: HIGH</span>
                   </div>
                 </div>

                 <p className="text-primary mt-4">&gt; Waiting for subject input...<span className="animate-pulse">_</span></p>
              </div>
            </motion.div>

            {/* Glitch UI Cards */}
            <GlitchCard 
              delay={1.2} 
              icon={Code} 
              title="Data.Match" 
              value="SDE_II::92%"
              className="-left-12 top-20 shadow-[0_0_20px_rgba(57,255,20,0.15)]"
              color="#39FF14" // Primary green
            />
            
            <GlitchCard 
              delay={1.4} 
              icon={Target} 
              title="Status.Tracking" 
              value="ACTIVE"
              className="-right-8 top-1/3 shadow-[0_0_20px_rgba(255,0,255,0.15)]"
              color="#FF00FF" // Secondary pink
            />

            <GlitchCard 
              delay={1.6} 
              icon={Cpu} 
              title="Sys.Process" 
              value="ROUND_3"
              className="-left-4 bottom-32 shadow-[0_0_20px_rgba(0,255,255,0.15)]"
              color="#00FFFF" // Accent cyan
            />
          </div>

        </div>
      </div>
    </section>
  );
}
