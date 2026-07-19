"use client";

import { motion } from 'framer-motion';

const COMPANIES = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Tesla", "Adobe"
];

export default function SocialProof() {
  return (
    <section className="py-12 border-y border-white/5 bg-surface/30">
      <div className="container mx-auto px-6 lg:px-12">
        <p className="text-center text-sm font-medium text-secondary-text mb-8">
          Trusted by students placed at world-class companies
        </p>
        
        <div className="flex overflow-hidden relative w-full mask-image-linear-gradient">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <motion.div
            animate={{ x: [0, -1036] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex items-center gap-16 min-w-max pr-16"
          >
            {[...COMPANIES, ...COMPANIES].map((company, index) => (
              <div 
                key={index} 
                className="text-2xl font-heading font-bold text-secondary-text/40 hover:text-secondary-text/80 transition-colors"
              >
                {company}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
