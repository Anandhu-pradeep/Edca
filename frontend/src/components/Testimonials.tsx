"use client";

import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const testimonials = [
  {
    name: "USR_094F",
    role: "FRONTEND_DEV // SECTOR_7",
    image: "[ 01 ]",
    content: "> The AI interviewer protocols were intense but effective. Simulated pressure environments prepared me for the actual interrogation. Data parsing was accurate.",
    color: "text-primary",
    borderColor: "border-primary"
  },
  {
    name: "USR_112C",
    role: "SYS_ADMIN // CORE_NET",
    image: "[ 02 ]",
    content: "> Executed the mock interview routines prior to my Vercel assessment. The latency was non-existent. Telemetry feedback allowed me to patch vulnerabilities in my communication logic.",
    color: "text-secondary",
    borderColor: "border-secondary"
  },
  {
    name: "USR_883A",
    role: "SEC_OPS // NODE_4",
    image: "[ 03 ]",
    content: "> Biometric scanning identified my eye-contact deficiency immediately. Adjusted my physical parameters and bypassed the final hiring firewall. Highly recommended software.",
    color: "text-accent-cyan",
    borderColor: "border-accent-cyan"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-surface border-y border-white/10 relative overflow-hidden">
      
      {/* Glitch overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
             <Terminal className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-heading text-primary uppercase tracking-widest">&gt; tail -f user_feedback.log</span>
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading font-bold mb-6 text-primary-text uppercase"
          >
            User <span className="text-primary">Logs</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-background border ${testimonial.borderColor} p-6 flex flex-col cursor-crosshair group hover:bg-white/5 transition-colors relative`}
            >
              {/* Corner Accents */}
              <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${testimonial.borderColor}`} />
              <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${testimonial.borderColor}`} />

              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className={`text-xl font-heading font-bold ${testimonial.color}`}>
                  {testimonial.image}
                </div>
                <div className="text-right">
                  <div className="font-heading font-bold text-white text-[12px] uppercase tracking-wider">{testimonial.name}</div>
                  <div className="text-[8px] font-heading text-secondary-text uppercase tracking-widest">{testimonial.role}</div>
                </div>
              </div>
              
              <div className="flex-1 font-heading text-[11px] text-secondary-text leading-relaxed">
                {testimonial.content}
                <span className={`inline-block w-1.5 h-3 ml-1 ${testimonial.color} animate-pulse align-middle opacity-0 group-hover:opacity-100`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
