"use client";

import { motion } from 'framer-motion';
import { Check, Terminal, ShieldAlert } from 'lucide-react';

const plans = [
  {
    name: "TRIAL_ACCESS",
    price: "0.00",
    currency: "USD",
    description: "Limited access for system evaluation.",
    features: [
      "1 AI Mock Interview / Month",
      "Basic Data Parsing (Resume)",
      "Standard Telemetry Logs",
      "Public Node Support"
    ],
    buttonText: "[ INIT_TRIAL ]",
    highlight: false,
    color: "text-accent-cyan",
    borderColor: "border-accent-cyan/50"
  },
  {
    name: "ROOT_ACCESS",
    price: "12.00",
    currency: "USD",
    period: "/MO",
    description: "Unrestricted system privileges for optimal preparation.",
    features: [
      "Unlimited AI Mock Interviews",
      "Advanced Role Simulation",
      "Deep Biometric Analytics",
      "Priority Encrypted Support",
      "Custom Environment Config"
    ],
    buttonText: "[ ACQUIRE_ROOT ]",
    highlight: true,
    color: "text-primary",
    borderColor: "border-primary"
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-background relative border-b border-white/10">
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 border border-secondary/50 bg-secondary/10">
            <ShieldAlert className="w-4 h-4 text-secondary" />
            <span className="text-[10px] font-heading text-secondary uppercase tracking-widest">Paywall Activated</span>
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading font-bold mb-6 text-primary-text uppercase"
          >
            Access <span className="text-secondary">Tiers</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-secondary-text font-heading text-sm uppercase tracking-widest"
          >
            Select required privilege level to proceed.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className={`relative bg-surface/50 border ${plan.borderColor} p-8 flex flex-col group hover:bg-surface transition-colors`}
            >
              {/* Terminal Header */}
              <div className="absolute top-0 left-0 w-full h-6 border-b border-white/10 bg-black/50 flex items-center px-2 gap-2">
                 <Terminal className="w-3 h-3 text-secondary-text" />
                 <span className="text-[8px] font-heading text-secondary-text uppercase tracking-widest">{plan.name}.sh</span>
              </div>
              
              <div className="mt-4 mb-8">
                <h3 className={`text-xl font-heading font-bold mb-2 uppercase tracking-wider ${plan.color}`}>{plan.name}</h3>
                <p className="text-[10px] font-heading text-secondary-text uppercase tracking-widest border-l-2 border-white/20 pl-2">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className={`text-4xl font-heading font-bold text-white`}>{plan.price}</span>
                  <span className="text-sm font-heading text-secondary-text">{plan.currency}</span>
                  {plan.period && <span className="text-[10px] font-heading text-secondary-text uppercase">{plan.period}</span>}
                </div>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1 border-t border-white/10 pt-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-secondary-text font-heading text-[11px] uppercase tracking-wider">
                    <Check className={`w-4 h-4 shrink-0 ${plan.color}`} />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-3 font-heading text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2
                  ${plan.highlight 
                    ? 'bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-background shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_30px_rgba(57,255,20,0.6)]' 
                    : 'bg-transparent text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/10 hover:border-accent-cyan'
                }`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
