"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: "Is the AI interviewer actually scary?",
    answer: "Not at all. The AI interviewer is designed with pedagogical protocols to be encouraging. It simulates stress environments but provides constructive, non-judgmental feedback."
  },
  {
    question: "How does the resume intelligence work?",
    answer: "Simply upload a PDF. Our natural language processing subroutines extract your core competencies and generate a dynamic question matrix tailored to your exact profile."
  },
  {
    question: "Can I practice for non-engineering roles?",
    answer: "Yes. The system supports hundreds of roles including Product Management, Data Science, Marketing, and more."
  },
  {
    question: "Is there a free tier available?",
    answer: "Yes. The basic tier grants 1 full mock simulation cycle per month at no cost. Zero hidden fees."
  },
  {
    question: "How does the confidence analysis tracking work?",
    answer: "Using local optical sensors (webcam), the system runs a background script to track eye movement and micro-expressions. This data remains local and is used solely to generate your confidence score."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        
        <div className="text-center mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about the platform.
            </p>
          </div>
        </div>

        <div
          className="bg-card rounded-2xl border border-border p-6 md:p-10 shadow-2xl"
        >
          <div className="w-full flex flex-col space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              
              return (
                <div key={idx} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <button 
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-semibold text-foreground text-lg py-4 hover:opacity-80 transition-opacity"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={cn(
                      "w-5 h-5 transition-transform duration-300 text-muted-foreground",
                      isOpen ? "rotate-180 text-foreground" : ""
                    )} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-muted-foreground text-base leading-relaxed pb-4 pr-8">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
