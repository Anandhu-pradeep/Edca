"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isInitializing } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isInitializing && mounted) {
      if (!user) {
        router.replace('/sign');
        return;
      }
      if (!user.isOnboarded) {
        router.replace('/onboarding');
      } else {
        // Redirect to root localhost:3000 where the dashboard is hosted
        router.replace('/');
      }
    }
  }, [user, isInitializing, mounted, router]);

  if (!mounted || isInitializing || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading Calibrated Dashboard...</p>
        </div>
      </div>
    );
  }

  return <DashboardContent />;
}
