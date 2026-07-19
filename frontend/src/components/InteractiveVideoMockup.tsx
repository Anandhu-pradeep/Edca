"use client";

import { motion } from 'framer-motion';
import { Mic, Video, MonitorUp, PhoneOff, Terminal, Activity, Focus, Scan, Target } from 'lucide-react';

export default function InteractiveVideoMockup() {
  return (
    <section className="py-24 bg-background border-b border-primary/20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <div className="text-[10px] text-primary font-heading uppercase tracking-widest mb-4">&gt; establish_connection.sh --secure</div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 text-primary-text uppercase">
            Simulation <span className="text-primary">Interface</span>
          </h2>
          <p className="text-secondary-text font-heading text-sm uppercase tracking-widest border-l-2 border-primary pl-4 max-w-xl">
            Live WebRTC feed active. Biometric sensors engaged. Prepare for AI interrogation.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative max-w-6xl mx-auto glass-panel p-1 rounded-sm shadow-[0_0_50px_rgba(57,255,20,0.05)] border-primary/50"
        >
          {/* Top Bar HUD */}
          <div className="flex items-center justify-between mb-1 px-4 py-2 bg-primary/10 border-b border-primary/30">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <div className="w-6 h-2 bg-primary/40 animate-pulse" />
                <div className="w-6 h-2 bg-primary/60 animate-pulse" style={{ animationDelay: '200ms' }} />
                <div className="w-6 h-2 bg-primary/80 animate-pulse" style={{ animationDelay: '400ms' }} />
              </div>
              <div className="text-[10px] font-heading text-primary uppercase tracking-widest">
                UPLINK: STABLE // PING: 24ms
              </div>
            </div>
            <div className="text-[10px] font-heading text-accent-cyan uppercase tracking-widest border border-accent-cyan/50 px-2 py-0.5 bg-accent-cyan/10">
              REC_ID: 9942-X-ALPHA
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-1 h-auto lg:h-[600px] bg-background p-2 relative">
            
            {/* Left Sidebar (HUD Stats) */}
            <div className="w-full lg:w-1/4 flex flex-col gap-2">
              <div className="border border-white/10 bg-surface/50 p-4 h-1/2 relative overflow-hidden group hover:border-accent-cyan/50 transition-colors">
                <div className="absolute top-0 right-0 p-1"><Scan className="w-4 h-4 text-accent-cyan/30" /></div>
                <div className="flex items-center gap-2 mb-4 text-accent-cyan font-heading text-xs uppercase tracking-widest border-b border-white/10 pb-2">
                  <Activity className="w-4 h-4" /> Biometric_Data
                </div>
                
                <div className="space-y-4 mt-6">
                  <div>
                    <div className="flex justify-between text-[10px] font-heading text-secondary-text mb-1 uppercase">
                      <span>Heart_Rate_Est</span>
                      <span className="text-white">82 BPM</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 relative">
                       <div className="absolute top-0 left-0 h-full bg-accent-cyan w-[65%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-heading text-secondary-text mb-1 uppercase">
                      <span>Stress_Level</span>
                      <span className="text-primary">NOMINAL</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 relative">
                       <div className="absolute top-0 left-0 h-full bg-primary w-[30%]" />
                    </div>
                  </div>
                  
                  {/* Fake Sine Wave */}
                  <div className="mt-8 h-12 w-full border-t border-b border-white/5 relative flex items-center justify-center overflow-hidden opacity-50">
                     <div className="absolute w-full h-[1px] bg-white/20" />
                     <svg viewBox="0 0 100 20" className="w-full h-full stroke-accent-cyan stroke-[0.5] fill-none animate-[dash_2s_linear_infinite]">
                        <path d="M0,10 Q10,0 20,10 T40,10 T60,10 T80,10 T100,10" />
                     </svg>
                  </div>
                </div>
              </div>
              
              <div className="border border-white/10 bg-surface/50 p-4 h-1/2 relative group hover:border-secondary/50 transition-colors">
                 <div className="flex items-center gap-2 mb-4 text-secondary font-heading text-xs uppercase tracking-widest border-b border-white/10 pb-2">
                  <Target className="w-4 h-4" /> Resume_Context
                </div>
                <ul className="text-[10px] font-heading text-secondary-text space-y-2 uppercase">
                  <li className="flex justify-between"><span>Match_Score:</span> <span className="text-secondary">94.2%</span></li>
                  <li className="flex justify-between"><span>Role:</span> <span>SYS_ADMIN</span></li>
                  <li className="flex justify-between"><span>Exp_Level:</span> <span>L4 (MID)</span></li>
                  <li className="mt-4 pt-4 border-t border-white/5 text-primary animate-pulse">Waiting for query...</li>
                </ul>
              </div>
            </div>

            {/* Main Video Area (Candidate Camera Feed) */}
            <div className="flex-1 relative bg-[#020202] border border-primary/30 shadow-inner flex overflow-hidden">
              {/* Scanlines on video */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-20" />
              
              {/* HUD Elements overlaying the video feed */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <div className="w-2 h-2 bg-red-500 animate-pulse" />
                 <span className="text-[10px] font-heading text-red-500 uppercase tracking-widest">REC</span>
              </div>
              
              <div className="absolute top-4 right-4 z-10 text-[10px] font-heading text-primary uppercase tracking-widest bg-black/50 px-2 py-1 border border-primary/30">
                 SUBJECT_CAM_01
              </div>

              {/* Fake face targeting brackets */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 z-10">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/60" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/60" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/60" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/60" />
                <Focus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary/20" />
              </div>
              
              {/* Central abstraction of user */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-32 h-32 rounded-full border border-primary/30 animate-[spin_10s_linear_infinite] flex items-center justify-center">
                   <div className="w-24 h-24 rounded-full border border-accent-cyan/30 animate-[spin_7s_linear_infinite_reverse]" />
                </div>
              </div>
              
              {/* Control Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur-md px-6 py-2 border border-white/20 z-30">
                <button className="p-2 hover:bg-white/10 transition-colors text-white">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/10 transition-colors text-white">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/10 transition-colors text-white">
                  <MonitorUp className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-white/20 mx-2" />
                <button className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500 border border-red-500 text-red-500 hover:text-white text-[10px] font-heading font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                  <PhoneOff className="w-3 h-3" /> Terminate
                </button>
              </div>
            </div>

            {/* Right Sidebar (AI Interviewer / Terminal Log) */}
            <div className="w-full lg:w-1/3 flex flex-col gap-2">
              <div className="h-[200px] bg-[#020202] border border-white/10 relative overflow-hidden flex items-center justify-center group hover:border-primary/50 transition-colors">
                 {/* AI visual representation */}
                 <div className="absolute inset-0 bg-primary/5 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.1)_0%,transparent_70%)]" />
                 <div className="w-16 h-16 border-2 border-primary flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(57,255,20,0.3)]">
                   <div className="absolute inset-2 border border-primary animate-pulse" />
                   <div className="w-2 h-2 bg-primary animate-ping" />
                 </div>
                 
                 <div className="absolute bottom-2 left-2 text-[10px] font-heading text-primary bg-black px-2 py-0.5 border border-primary/30 uppercase tracking-widest z-10">
                    ENTITY_AI_01
                 </div>
                 {/* Decorative brackets */}
                 <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-primary/50" />
                 <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-primary/50" />
              </div>
              
              <div className="bg-surface/50 border border-white/10 p-4 flex-1 flex flex-col relative group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 text-[10px] font-heading text-primary uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                  <Terminal className="w-3 h-3" /> System_Transcript.log
                </div>
                <div className="space-y-4 overflow-y-auto flex-1 pr-2 font-heading text-xs">
                  <div className="text-secondary-text">
                    <span className="text-primary block mb-1">&gt; ENTITY_AI_01</span>
                    [Q] Describe the architecture you would implement for a high-traffic, real-time logging system. Specify the tech stack.
                  </div>
                  <div className="text-secondary-text opacity-70">
                    <span className="text-secondary block mb-1">&gt; SUBJECT_01</span>
                    [A] I would utilize Kafka for message queuing, ingested by a Go microservice, and then...
                  </div>
                  <div className="text-primary animate-pulse">_</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
