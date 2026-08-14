"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrganizationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col">
        <div className="flex items-center gap-4 mb-8 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full liquid-glass-subtle shrink-0 hover:bg-secondary/80"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold font-heading">Settings</h1>
        </div>
        
        <div className="flex-1 pb-16 animate-in fade-in duration-300">
          <div className="liquid-glass p-8 md:p-16 text-center flex flex-col items-center justify-center min-h-[500px]">
            <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center mb-6">
              <Briefcase className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4">Upgrade to Organization</h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-lg">
              Organizations can manage teams, post job listings, conduct interviews at scale, and access enterprise features.
            </p>
            <Button size="lg" className="rounded-full px-10 py-6 text-lg shadow-xl">
              Convert to Organization Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
