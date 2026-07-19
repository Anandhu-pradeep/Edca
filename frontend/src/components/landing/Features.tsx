"use client";

import { motion } from 'framer-motion';
import { BrainCircuit, Activity, Video, Target, FileSpreadsheet, Building2, CreditCard, Presentation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const features = [
  {
    title: "Resume Intelligence",
    description: "Deep AI analysis of your resume to tailor your upcoming interview questions.",
    icon: <FileSpreadsheet className="w-6 h-6 text-primary" />,
    gradient: "from-primary/20 to-transparent",
    border: "group-hover:border-primary/50"
  },
  {
    title: "Confidence Analysis",
    description: "Real-time facial and vocal tracking to measure and improve your interview presence.",
    icon: <Activity className="w-6 h-6 text-accent-cyan" />,
    gradient: "from-accent-cyan/20 to-transparent",
    border: "group-hover:border-accent-cyan/50"
  },
  {
    title: "AI Interview",
    description: "Immersive simulated interviews with a responsive, intelligent digital mentor.",
    icon: <BrainCircuit className="w-6 h-6 text-secondary" />,
    gradient: "from-secondary/20 to-transparent",
    border: "group-hover:border-secondary/50"
  },
  {
    title: "Job Role Assessment",
    description: "Scenario-based technical and behavioral questions tuned to your specific role.",
    icon: <Target className="w-6 h-6 text-accent-green" />,
    gradient: "from-accent-green/20 to-transparent",
    border: "group-hover:border-accent-green/50"
  },
  {
    title: "Video Conferencing",
    description: "Crystal clear, low-latency video rooms for human-led mock interviews.",
    icon: <Video className="w-6 h-6 text-accent-blue" />,
    gradient: "from-accent-blue/20 to-transparent",
    border: "group-hover:border-accent-blue/50"
  },
  {
    title: "Performance Reports",
    description: "Detailed, actionable feedback and scoring across 15+ interview metrics.",
    icon: <Presentation className="w-6 h-6 text-primary" />,
    gradient: "from-primary/20 to-transparent",
    border: "group-hover:border-primary/50"
  },
  {
    title: "Organization Dashboard",
    description: "Tools for universities and recruiters to track candidate progress.",
    icon: <Building2 className="w-6 h-6 text-secondary" />,
    gradient: "from-secondary/20 to-transparent",
    border: "group-hover:border-secondary/50"
  },
  {
    title: "Payment Integration",
    description: "Secure, seamless subscription management via enterprise-grade billing.",
    icon: <CreditCard className="w-6 h-6 text-accent-cyan" />,
    gradient: "from-accent-cyan/20 to-transparent",
    border: "group-hover:border-accent-cyan/50"
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-background relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-foreground">
              Everything you need to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                succeed
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              A complete ecosystem of AI-powered tools designed to transform your interview preparation from stressful to successful.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={feature.title}>
              <Card className={cn(
                "group relative overflow-hidden h-full bg-card border-border hover:bg-muted transition-all duration-300",
                feature.border
              )}>
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
                  feature.gradient
                )} />
                <div className="relative z-10 p-8 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-2xl bg-background shadow-sm border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold font-heading mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mt-auto">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
