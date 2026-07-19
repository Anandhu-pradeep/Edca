"use client";

import { motion } from 'framer-motion';
import { Target, Eye, Mic, CheckCircle2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
  delay?: number;
  duration?: number;
}

function StatCard({ icon, label, value, className, delay = 0, duration = 6 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay + 0.5, duration: 0.5 }}
      className={cn("absolute glass-panel px-4 py-3 flex items-center gap-3 z-20", className)}
      style={{
        animation: `float ${duration}s ease-in-out infinite ${delay}s`
      }}
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-semibold text-secondary-text uppercase tracking-wider">{label}</div>
        <div className="text-sm font-bold text-primary-text">{value}</div>
      </div>
    </motion.div>
  );
}

export function FloatingStats() {
  return (
    <div className="absolute inset-0 pointer-events-none w-full h-full">
      <StatCard 
        icon={<Award className="w-4 h-4" />}
        label="Resume Score"
        value="92%"
        className="top-[15%] right-[5%] md:right-[20%] scale-90 md:scale-100"
        delay={0}
      />
      <StatCard 
        icon={<CheckCircle2 className="w-4 h-4" />}
        label="Confidence"
        value="Excellent"
        className="top-[35%] left-[5%] md:left-[15%] hidden md:flex"
        delay={1.2}
        duration={7}
      />
      <StatCard 
        icon={<Eye className="w-4 h-4" />}
        label="Eye Contact"
        value="Great"
        className="top-[50%] right-[5%] md:right-[15%] hidden md:flex"
        delay={0.5}
        duration={5}
      />
      <StatCard 
        icon={<Mic className="w-4 h-4" />}
        label="Communication"
        value="Strong"
        className="top-[70%] left-[5%] md:left-[25%] scale-90 md:scale-100"
        delay={2}
        duration={6.5}
      />
      <StatCard 
        icon={<Target className="w-4 h-4" />}
        label="Interview Ready"
        value="95%"
        className="top-[85%] right-[5%] md:right-[30%] hidden lg:flex"
        delay={1.5}
        duration={5.5}
      />
    </div>
  );
}
