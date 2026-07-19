"use client";

import { motion } from 'framer-motion';
import { Users, Calendar, BarChart3, ShieldCheck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EnterpriseFeature = ({ icon: Icon, title, desc, delay = 0 }: any) => (
  <div 
    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors"
  >
    <div className="w-12 h-12 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center shrink-0">
      <Icon className="w-6 h-6 text-foreground" />
    </div>
    <div>
      <h4 className="font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  </div>
);

export function Organizations() {
  return (
    <section id="organizations" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div>

              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-foreground">
                Scale your hiring with <br/>
                <span className="text-primary">AI Intelligence</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Empower your recruiting team with comprehensive analytics, automated scheduling, and standardized AI pre-screening.
              </p>
              
              <div className="space-y-2 mb-8">
                <EnterpriseFeature 
                  icon={Users} 
                  title="Candidate Management" 
                  desc="Organize, filter, and track thousands of candidates seamlessly." 
                  delay={0.1} 
                />
                <EnterpriseFeature 
                  icon={Calendar} 
                  title="Interview Scheduling" 
                  desc="Automated booking links synced directly with recruiters' calendars." 
                  delay={0.2} 
                />
                <EnterpriseFeature 
                  icon={BarChart3} 
                  title="Performance Analytics" 
                  desc="Deep insights into interviewer calibration and candidate success rates." 
                  delay={0.3} 
                />
                <EnterpriseFeature 
                  icon={ShieldCheck} 
                  title="Enterprise Security" 
                  desc="SOC2 compliant, SSO integration, and custom data retention policies." 
                  delay={0.4} 
                />
              </div>

              <Button className="w-full sm:w-auto h-14 rounded-full px-8 text-base bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all">
                Explore Enterprise Solutions
              </Button>
            </div>
          </div>

          {/* Abstract Tech Graphic */}
          <div className="order-1 lg:order-2 relative perspective-1000">
            <div 
              className="relative rounded-2xl bg-card border border-border shadow-2xl overflow-hidden aspect-[4/3] perspective-1000"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
              
              <div className="absolute inset-0 p-8 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div className="h-6 w-48 bg-muted rounded-md border border-border shadow-sm" />
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                  </div>
                </div>
                
                <div className="flex gap-4 mb-4">
                  <div className="h-24 flex-1 rounded-xl bg-muted/50 border border-border p-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 mb-3" />
                    <div className="h-2 w-1/2 bg-primary/20 rounded-full" />
                  </div>
                  <div className="h-24 flex-1 rounded-xl bg-muted/50 border border-border p-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 mb-3" />
                    <div className="h-2 w-1/2 bg-primary/20 rounded-full" />
                  </div>
                  <div className="h-24 flex-1 rounded-xl bg-muted/50 border border-border p-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 mb-3" />
                    <div className="h-2 w-1/2 bg-primary/20 rounded-full" />
                  </div>
                </div>
                
                <div className="flex-1 rounded-xl bg-card border border-border p-4 flex flex-col gap-3">
                  <div className="h-3 w-1/4 bg-muted rounded-full" />
                  <div className="h-full w-full bg-muted/30 rounded-lg overflow-hidden flex items-end px-4 gap-2">
                    {[30, 45, 25, 60, 80, 50, 70, 40].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/50 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
