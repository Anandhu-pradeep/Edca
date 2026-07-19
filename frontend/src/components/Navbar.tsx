"use client";

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? 'py-4 bg-background/90 backdrop-blur-md border-primary/50 shadow-[0_4px_30px_rgba(57,255,20,0.15)]' 
          : 'py-6 bg-transparent border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-surface border border-primary/50 flex items-center justify-center font-heading font-bold text-primary shadow-[0_0_15px_rgba(57,255,20,0.2)] group-hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] transition-all">
              CE
            </div>
            <span className="font-heading font-bold text-xl tracking-widest text-primary-text hidden sm:block uppercase">
              Career_Edge
              <span className="animate-pulse text-primary">_</span>
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-heading font-bold text-secondary-text tracking-widest uppercase">
            {['Features', 'System', 'Pricing', 'Network'].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="hover:text-primary transition-colors hover:shadow-[0_0_10px_rgba(57,255,20,0.5)]"
              >
                [{item}]
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button className="px-5 py-2 text-sm font-heading font-bold text-secondary-text hover:text-primary transition-colors uppercase tracking-widest">
              &gt; Login
            </button>
            <button className="px-6 py-2 bg-primary/10 border border-primary text-primary text-sm font-heading font-bold tracking-widest uppercase hover:bg-primary hover:text-background transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_30px_rgba(57,255,20,0.6)]">
              Initialize
            </button>
          </div>

          <button className="lg:hidden text-primary p-2 border border-primary bg-primary/10 shadow-[0_0_10px_rgba(57,255,20,0.2)]">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
