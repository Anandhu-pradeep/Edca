"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Sparkles, 
  ShieldCheck, 
  Rocket, 
  Terminal, 
  BrainCircuit, 
  Target, 
  TrendingUp, 
  LogOut, 
  Settings, 
  Bell, 
  User as UserIcon, 
  FileText, 
  Award, 
  Play, 
  CheckCircle2, 
  Building2, 
  ChevronRight,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export function DashboardContent() {
  const router = useRouter();
  const { user, logout, setOnboarded } = useAuthStore();

  if (!user) return null;

  const username = user.username || user.email?.split('@')[0] || 'anandhu_dev';
  const targetRole = user.targetRole || 'Software Engineer';
  const experienceLevel = user.experienceLevel || 'Fresher';
  const techStack = user.techStack && user.techStack.length > 0 ? user.techStack : ['React', 'Java', 'Spring Boot', 'System Design', 'TypeScript', 'AWS'];
  const resumeName = user.resumeName || 'Anandhu_Pradeep_Resume_2026.pdf';
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || username)}&background=3b82f6&color=fff&size=256&bold=true`;
  const [avatar, setAvatar] = useState<string>(user.avatar || defaultAvatar);

  useEffect(() => {
    if (user.avatar && !user.avatar.startsWith('blob:')) {
      setAvatar(user.avatar);
    } else {
      setAvatar(defaultAvatar);
    }
  }, [user.avatar, defaultAvatar]);

  const handleRestartOnboarding = () => {
    setOnboarded(false);
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            {/* Light Logo (visible in light mode) */}
            <Image 
              src="/logo-light.png" 
              alt="Edca Logo" 
              width={180} 
              height={48} 
              className="block dark:hidden h-10 w-auto object-contain"
            />
            {/* Dark Logo (visible in dark mode) */}
            <Image 
              src="/logo-dark.png" 
              alt="Edca Logo" 
              width={180} 
              height={48} 
              className="hidden dark:block h-10 w-auto object-contain"
            />
            <span className="text-xl font-bold font-heading text-foreground tracking-tight">
              Edca
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm" className="rounded-xl hidden sm:inline-flex text-xs font-semibold">
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                <span>Security & Sessions</span>
              </Button>
            </Link>

            <button 
              onClick={handleRestartOnboarding}
              title="Test Onboarding Flow Again"
              className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-white transition-colors text-muted-foreground flex items-center gap-1.5 text-xs font-medium px-3"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Test Onboarding</span>
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-border/50">
              <img src={avatar} alt={username} className="w-8 h-8 rounded-full object-cover border-2 border-primary/40 shadow-sm" onError={() => setAvatar(defaultAvatar)} />
              <div className="hidden sm:block text-right">
                <span className="text-xs font-bold block text-foreground">@{username}</span>
                <span className="text-[10px] text-muted-foreground block">{targetRole}</span>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={logout} title="Log out" className="text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
      </main>
    </div>
  );
}
