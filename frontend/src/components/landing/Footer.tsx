"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="relative bg-background pt-32 pb-12 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold font-heading mb-8 text-foreground max-w-3xl leading-tight"
          >
            Your Dream Job Starts With One <span className="text-primary">Great Interview.</span>
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Button size="lg" className="h-14 rounded-full px-10 text-lg bg-primary hover:opacity-90 text-primary-foreground shadow-xl transition-transform hover:scale-105 group">
              Start Your AI Interview
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-border pt-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* Light Logo (visible in light mode) */}
              <Image 
                src="/logo-light.png" 
                alt="Edca Logo" 
                width={180} 
                height={48} 
                className="block dark:hidden h-12 w-auto object-contain"
              />
              {/* Dark Logo (visible in dark mode) */}
              <Image 
                src="/logo-dark.png" 
                alt="Edca Logo" 
                width={180} 
                height={48} 
                className="hidden dark:block h-12 w-auto object-contain"
              />
              <span className="font-heading font-bold text-xl tracking-tight text-foreground">Edca</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered interview preparation platform. Practice realistic interviews and get hired faster.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Organizations</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Interview Guides</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Edca. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
