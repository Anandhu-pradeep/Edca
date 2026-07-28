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
  Loader2,
  Check
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
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(`@${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

          <div className="relative flex items-center gap-3">
            <button 
              onClick={handleCopyUsername}
              title="Click to copy username"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/30 hover:bg-secondary/70 border border-transparent hover:border-border/60 transition-all text-foreground cursor-pointer"
            >
              <span className="text-base font-extrabold tracking-tight">@{username}</span>
              {copied && (
                <Check className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in-50 duration-150" />
              )}
            </button>
            <button 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform active:scale-95 cursor-pointer"
              title="Account Menu"
            >
              <img 
                src={avatar} 
                alt={username} 
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/40 shadow-md hover:border-primary transition-colors" 
                onError={() => setAvatar(defaultAvatar)} 
              />
            </button>

            {/* Backdrop to close menu on outside click */}
            {profileMenuOpen && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setProfileMenuOpen(false)} 
              />
            )}

            {/* Clickable Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-14 w-56 rounded-2xl bg-card border border-border/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-border/50 mb-1">
                  <p className="text-xs font-semibold text-foreground truncate">{user.firstName || username}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email || `@${username}`}</p>
                </div>

                <Link 
                  href="/onboarding" 
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span>Profile</span>
                </Link>

                <Link 
                  href="/dashboard/settings" 
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <Settings className="w-4 h-4 text-indigo-500" />
                  <span>Settings</span>
                </Link>

                <Link 
                  href="/#pricing" 
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>Subscription</span>
                </Link>

                <div className="h-px bg-border/60 my-1" />

                <button 
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Dashboard Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
      </main>
    </div>
  );
}
