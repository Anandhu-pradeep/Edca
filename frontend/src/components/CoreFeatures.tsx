"use client";

import { motion } from 'framer-motion';
import { Cpu, Video, Fingerprint, BarChart3, Binary, Network } from 'lucide-react';

const features = [
  {
    title: "Data Parsing",
    description: "Extract core competencies from uploaded resume datasets to configure interview logic.",
    icon: Binary,
    color: "#39FF14",
    borderClass: "hover:border-primary"
  },
  {
    title: "Role Simulation",
    description: "Initialize specific industry scenarios. From backend engineering to product ops.",
    icon: Network,
    color: "#FF00FF",
    borderClass: "hover:border-secondary"
  },
  {
    title: "Video Link established",
    description: "Enter the low-latency WebRTC zone. Stable connection required for optimal processing.",
    icon: Video,
    color: "#00FFFF",
    borderClass: "hover:border-accent-cyan"
  },
  {
    title: "Biometric Scan",
    description: "Real-time analysis of micro-expressions and eye tracking for confidence scoring.",
    icon: Fingerprint,
    color: "#39FF14",
    borderClass: "hover:border-primary"
  },
  {
    title: "Telemetry Output",
    description: "Post-session data logs. Review pacing, technical accuracy, and system feedback.",
    icon: BarChart3,
    color: "#FF00FF",
    borderClass: "hover:border-secondary"
  },
  {
    title: "Node Dashboard",
    description: "For admins: Monitor all connected candidates and access encrypted performance data.",
    icon: Cpu,
    color: "#00FFFF",
    borderClass: "hover:border-accent-cyan"
  }
];

export default function CoreFeatures() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background border-b border-white/10">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-background to-background" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-3xl mb-16">
          <div className="text-[10px] text-primary font-heading uppercase tracking-widest mb-4">&gt; ./features.sh</div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading font-bold mb-6 text-primary-text uppercase"
          >
            System Capabilities
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-secondary-text font-heading text-sm uppercase tracking-widest border-l-2 border-primary pl-4 max-w-xl leading-relaxed"
          >
            Core modules loaded. AI subroutines ready for processing. Proceed to review available tools.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`glass-panel p-6 flex flex-col group cursor-crosshair transition-colors duration-300 ${feature.borderClass}`}
            >
              <div className="flex items-center justify-between mb-8">
                <div 
                  className="w-12 h-12 border flex items-center justify-center bg-surface shadow-inner group-hover:bg-opacity-20 transition-all duration-300"
                  style={{ borderColor: feature.color, boxShadow: `inset 0 0 10px ${feature.color}20`, color: feature.color }}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-heading text-secondary-text opacity-50 group-hover:opacity-100 transition-opacity">
                  ID: 0x{idx}A
                </div>
              </div>
              
              <h3 className="text-lg font-heading font-bold text-primary-text mb-3 uppercase tracking-wider">
                {feature.title}
              </h3>
              
              <p className="text-secondary-text font-sans text-sm leading-relaxed">
                {feature.description}
              </p>
              
              {/* Decorative Corner Brackets */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-white transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-white transition-colors" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-white transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-white transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
