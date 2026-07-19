"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "> ERR: IS_AI_SCARY = TRUE?",
    answer: "[ FALSE ] The AI interviewer is designed with pedagogical protocols to be encouraging. It simulates stress environments but provides constructive, non-judgmental feedback."
  },
  {
    question: "> HOW DOES DATA_PARSER WORK?",
    answer: "Upload a PDF. Our natural language processing subroutines extract your core competencies and generate a dynamic question matrix tailored to your exact profile."
  },
  {
    question: "> CAN I CONFIGURE FOR ROLE = 'MARKETING'?",
    answer: "[ AFFIRMATIVE ] The system supports hundreds of roles. Software Engineering, Data Science, Marketing, and Product Management modules are fully operational."
  },
  {
    question: "> IS TRIAL_ACCESS ACTUALLY FREE?",
    answer: "Yes. The TRIAL_ACCESS tier grants 1 full mock simulation cycle per month at no cost. Zero hidden fees."
  },
  {
    question: "> EXPLAIN BIOMETRIC_TRACKING.",
    answer: "Using local optical sensors (webcam), the system runs a background script to track eye movement and micro-expressions. This data remains local and is used solely to generate your confidence score."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-surface border-y border-white/10 relative">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl relative z-10">
        
        <div className="text-center mb-16">
          <div className="w-12 h-12 mx-auto bg-background border border-primary flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
            <Terminal className="w-6 h-6 text-primary" />
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading font-bold mb-6 text-primary-text uppercase"
          >
            System <span className="text-primary">Queries</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-secondary-text text-sm font-heading uppercase tracking-widest"
          >
            Frequently asked questions. Accessing knowledge base...
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-background border border-white/10 p-6 shadow-inner"
        >
          <div className="w-full flex flex-col space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              
              return (
                <div key={idx} className="border-b border-white/10 last:border-0">
                  <button 
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-heading font-bold text-primary text-sm uppercase tracking-widest py-6 hover:text-white transition-colors"
                  >
                    <span>{faq.question.replace('>', '&gt;')}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-primary'}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-secondary-text text-xs font-heading uppercase tracking-widest leading-relaxed pb-6 pr-8 border-l-2 border-primary/50 pl-4 ml-2">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
