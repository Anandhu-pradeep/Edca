"use client";

import { motion } from 'framer-motion';
import { Server, Users, Activity, Terminal } from 'lucide-react';

export default function Organizations() {
  return (
    <section id="network" className="py-24 bg-background border-y border-white/10 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />

      <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        <div className="order-2 lg:order-1 relative">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-surface p-1 border border-accent-cyan/40 shadow-[0_0_30px_rgba(0,255,255,0.1)]"
          >
            {/* Dashboard Mockup Header */}
            <div className="flex items-center justify-between mb-1 px-4 py-3 bg-accent-cyan/10 border-b border-accent-cyan/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-background border border-accent-cyan flex items-center justify-center text-accent-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-heading font-bold text-accent-cyan uppercase tracking-widest">Global_Network_Node</div>
                  <div className="text-[10px] font-heading text-secondary-text uppercase tracking-widest">Auth: ADMIN_LEVEL_4</div>
                </div>
              </div>
              <button className="px-3 py-1 bg-accent-cyan/20 border border-accent-cyan text-accent-cyan text-[10px] font-heading font-bold uppercase tracking-widest hover:bg-accent-cyan hover:text-background transition-colors">
                [ INIT_BATCH ]
              </button>
            </div>

            <div className="p-4 bg-background">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-4 border border-white/10 bg-surface/50 group hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-heading text-secondary-text mb-2 uppercase tracking-widest">
                    <Users className="w-3 h-3 text-primary" /> Active_Nodes
                  </div>
                  <div className="text-2xl font-heading font-bold text-primary">1,248</div>
                </div>
                <div className="p-4 border border-white/10 bg-surface/50 group hover:border-secondary/50 transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-heading text-secondary-text mb-2 uppercase tracking-widest">
                    <Activity className="w-3 h-3 text-secondary" /> Avg_Sync_Rate
                  </div>
                  <div className="text-2xl font-heading font-bold text-secondary">85.4%</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-heading text-white mb-2 uppercase tracking-widest border-b border-white/10 pb-1">Recent_Connections.log</div>
                {[
                  { name: "USR_0x1A", role: "SYS_ARCHITECT", score: 92, status: "VERIFIED" },
                  { name: "USR_0x2B", role: "DATA_ENGINEER", score: 88, status: "VERIFIED" },
                  { name: "USR_0x3C", role: "NET_SEC", score: 65, status: "FAILED" }
                ].map((candidate, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border border-white/5 bg-surface/30 hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-background border border-white/20 flex items-center justify-center text-[10px] font-heading text-secondary-text">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-[10px] font-heading text-white uppercase tracking-widest">{candidate.name}</div>
                        <div className="text-[8px] font-heading text-secondary-text uppercase tracking-widest">{candidate.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] font-heading text-white">{candidate.score}</div>
                      <div className={`text-[8px] font-heading px-1.5 py-0.5 border ${candidate.status === 'VERIFIED' ? 'border-primary/50 text-primary bg-primary/10' : 'border-red-500/50 text-red-500 bg-red-500/10'}`}>
                        {candidate.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="text-[10px] text-secondary font-heading uppercase tracking-widest mb-4">&gt; root access granted</div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading font-bold mb-6 text-primary-text uppercase"
          >
            Scale Your <br/>
            <span className="text-secondary">Network.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-secondary-text font-heading text-sm uppercase tracking-widest mb-8 border-l-2 border-secondary pl-4 leading-relaxed"
          >
            Deploy assessment nodes across your entire organization. Process thousands of candidates simultaneously through automated AI screening subroutines. Access aggregated telemetry and filter top-performing assets.
          </motion.p>
          
          <ul className="space-y-4 mb-8">
            {[
              { text: 'Mass Node Deployment (Bulk Invites)', icon: Users, color: 'text-primary', borderColor: 'border-primary' }, 
              { text: 'Global Telemetry Analytics', icon: Activity, color: 'text-secondary', borderColor: 'border-secondary' }, 
              { text: 'Encrypted Assessment Logs', icon: Terminal, color: 'text-accent-cyan', borderColor: 'border-accent-cyan' }
            ].map((item, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-[12px] font-heading text-white uppercase tracking-widest"
              >
                <div className={`w-8 h-8 bg-background border ${item.borderColor} flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                {item.text}
              </motion.li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}
