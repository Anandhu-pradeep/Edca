"use client";

import { motion } from 'framer-motion';
import { Database, Binary, Radio, Cpu, Download } from 'lucide-react';

const steps = [
  {
    icon: Database,
    title: "1. Upload Resume",
    description: "Transmit your data profile. The system will parse and index your history.",
    color: "text-primary",
    bgColor: "bg-primary"
  },
  {
    icon: Binary,
    title: "2. Select Parameters",
    description: "Input target role variables. Algorithms will align interview protocols.",
    color: "text-secondary",
    bgColor: "bg-secondary"
  },
  {
    icon: Radio,
    title: "3. Establish Uplink",
    description: "Connect to the WebRTC server. Prepare for live interaction.",
    color: "text-accent-cyan",
    bgColor: "bg-accent-cyan"
  },
  {
    icon: Cpu,
    title: "4. Neural Processing",
    description: "AI routines will analyze your responses, biometrics, and stress levels.",
    color: "text-primary",
    bgColor: "bg-primary"
  },
  {
    icon: Download,
    title: "5. Download Logs",
    description: "Retrieve comprehensive performance metrics. Calibrate for the next run.",
    color: "text-secondary",
    bgColor: "bg-secondary"
  }
];

export default function HowItWorks() {
  return (
    <section id="system" className="py-24 bg-surface border-y border-white/10 relative overflow-hidden">
      
      {/* Circuit board background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{
             backgroundImage: `radial-gradient(var(--color-primary) 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }} 
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
        <div className="max-w-3xl mb-20">
          <div className="text-[10px] text-accent-cyan font-heading uppercase tracking-widest mb-4">&gt; cat execution_flow.txt</div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading font-bold mb-6 text-primary-text uppercase"
          >
            Execution <span className="text-accent-cyan">Flow</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-secondary-text font-heading text-sm uppercase tracking-widest leading-relaxed border-l-2 border-accent-cyan pl-4"
          >
            Follow the designated sequence to initiate the mock interview simulation and retrieve your diagnostic data.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-8 md:gap-12 mb-12 last:mb-0 group">
              
              {/* Circuitry connecting line */}
              {idx !== steps.length - 1 && (
                <div className="absolute left-[19px] md:left-[27px] top-[50px] bottom-[-60px] w-[2px] bg-white/10">
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className={`w-full ${step.bgColor} shadow-[0_0_10px_var(--color-primary)]`}
                  />
                </div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-10 h-10 md:w-14 md:h-14 shrink-0 bg-background border border-white/20 flex items-center justify-center relative z-10 shadow-inner group-hover:border-white transition-colors"
              >
                <step.icon className={`w-5 h-5 md:w-6 md:h-6 ${step.color}`} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="glass-panel p-6 flex-1 hover:border-white/40 transition-colors relative"
              >
                {/* Tech corner accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />
                
                <h3 className={`text-lg font-heading font-bold mb-2 uppercase tracking-wider ${step.color}`}>
                  {step.title}
                </h3>
                <p className="text-secondary-text font-sans text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
