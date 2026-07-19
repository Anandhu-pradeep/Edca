"use client";

import { motion } from 'framer-motion';
import { Crosshair, Zap, Activity, ShieldAlert } from 'lucide-react';

export default function AIPerformanceReport() {
  return (
    <section className="py-24 bg-background border-y border-white/10 relative overflow-hidden">
      {/* Target Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Content */}
        <div className="max-w-2xl">
          <div className="text-[10px] text-primary font-heading uppercase tracking-widest mb-4">&gt; grep -r "performance" /logs</div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading font-bold mb-6 text-primary-text uppercase"
          >
            Telemetry & <span className="text-primary">Analytics</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-secondary-text font-heading text-sm uppercase tracking-widest mb-10 border-l-2 border-primary pl-4 leading-relaxed"
          >
            Post-session data logs provide comprehensive diagnostic analysis. System identifies vulnerabilities in pacing, technical accuracy, and physiological responses to optimize future deployments.
          </motion.p>

          <div className="space-y-4">
            {[
              { title: "Audio Analysis (Pacing)", desc: "Vocal frequency exceeded optimal thresholds during query 3. Recalibrate breathing.", icon: Zap, color: "text-accent-cyan", borderColor: "border-accent-cyan" },
              { title: "Optical Tracking", desc: "Camera engagement maintained at 94%. Subject focus remains steady.", icon: Crosshair, color: "text-primary", borderColor: "border-primary" },
              { title: "Knowledge Matrix", desc: "Node.js runtime questions resulted in high latency responses. Review documentation.", icon: Activity, color: "text-secondary", borderColor: "border-secondary" }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className={`flex items-start gap-4 p-4 bg-surface/50 border ${item.borderColor} relative group hover:bg-surface transition-colors`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-${item.borderColor.split('-')[1]} to-transparent opacity-50`} />
                
                <div className={`w-10 h-10 bg-background border ${item.borderColor} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-[12px] font-heading font-bold text-white uppercase tracking-widest mb-1">{item.title}</h4>
                  <p className="text-[10px] font-heading text-secondary-text uppercase tracking-wider">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Visual (Report Card) */}
        <div className="relative">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5 }}
             className="relative bg-[#020202] border border-primary p-6 shadow-[0_0_40px_rgba(57,255,20,0.1)]"
           >
             {/* HUD Brackets */}
             <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
             <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
             
             <div className="flex justify-between items-start mb-8 pb-4 border-b border-primary/30">
               <div>
                 <h3 className="text-xl font-heading font-bold text-primary uppercase tracking-widest">Diagnostic Report</h3>
                 <p className="text-[10px] font-heading text-secondary-text uppercase tracking-widest">Role: Frontend_Dev // Session: 0x9942</p>
               </div>
               <div className="px-2 py-1 bg-primary/20 border border-primary text-primary font-heading text-[10px] font-bold uppercase tracking-widest animate-pulse">
                 GRADE: A
               </div>
             </div>

             <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-heading text-white uppercase tracking-widest mb-1">
                    <span>Overall_Confidence_Score</span>
                    <span className="text-primary">92%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 relative border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '92%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="absolute top-0 left-0 h-full bg-primary"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-heading text-white uppercase tracking-widest mb-1">
                    <span>Technical_Accuracy</span>
                    <span className="text-secondary">88%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 relative border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '88%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="absolute top-0 left-0 h-full bg-secondary"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-heading text-white uppercase tracking-widest mb-1">
                    <span>Communication_Flow</span>
                    <span className="text-accent-cyan">95%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 relative border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '95%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="absolute top-0 left-0 h-full bg-accent-cyan"
                    />
                  </div>
                </div>
             </div>

             <div className="mt-8 p-3 bg-accent-cyan/10 border border-accent-cyan flex gap-3 items-start">
               <ShieldAlert className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
               <p className="text-[10px] font-heading text-accent-cyan uppercase tracking-widest leading-relaxed">
                 SYSTEM ADVISORY: Candidate is operating at near-optimal parameters. Review Node.js documentation to achieve 100% technical sync.
               </p>
             </div>
           </motion.div>
        </div>

      </div>
    </section>
  );
}
