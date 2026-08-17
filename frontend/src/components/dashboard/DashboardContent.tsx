"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from 'next-themes';
import { 
  Sparkles, 
  Settings, 
  Bell, 
  User as UserIcon, 
  FileText, 
  Play, 
  Shield,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Home,
  History,
  Calendar,
  Video,
  Briefcase,
  Moon,
  Sun,
  LifeBuoy,
  Users,
  LineChart as LineChartIcon,
  Tag,
  MonitorPlay,
  DollarSign,
  Package,
  ShoppingCart,
  Activity,
  ArrowUpRight,
  Target,
  TrendingUp,
  Terminal,
  LogOut,
  Book,
  Star,
  Bookmark,
  Smile,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InterviewsSection } from './sections/InterviewsSection';
import { AudienceSection } from './sections/AudienceSection';
import { AssignRolesSection } from './sections/AssignRolesSection';

// Mock data removed in favor of real data from the backend

export function DashboardContent() {
  const router = useRouter();
  const { user, logout, setOnboarded } = useAuthStore();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  const username = user.username || user.email?.split('@')[0] || 'anandhu_dev';
  const targetRole = user.targetRole || 'Technology Specialist';
  const experienceLevel = user.experienceLevel || 'Fresher';
  const resumeName = user.resumeName || 'Birth Certificate .pdf';
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || username)}&background=3b82f6&color=fff&size=256&bold=true`;
  
  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');
  
  const [avatar, setAvatar] = useState<string>(user.avatar || defaultAvatar);
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    // Fade out completely by 60px of scroll
    const newOpacity = Math.max(0, 1 - scrollTop / 60);
    setHeaderOpacity(newOpacity);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && activeTab === 'Dashboard') {
      setLoadingStats(true);
      // Fallback to mock data if backend doesn't exist yet, but trying to fetch real data
      import('@/lib/axios').then(({ axiosInstance }) => {
        axiosInstance.get('/interviews/dashboard-stats')
          .then(res => {
            if (res.data?.data) {
              setStats(res.data.data);
            }
          })
          .catch(err => {
            console.error("Failed to fetch dashboard stats", err);
            // Fallback for demo purposes if backend isn't ready
            setStats({
              interviewsTaken: 12,
              avgGrade: 'A-',
              activeJobs: 5,
              currentPlan: 'Pro',
              performanceData: [
                { name: 'Jan', score: 65 }, { name: 'Feb', score: 72 },
                { name: 'Mar', score: 68 }, { name: 'Apr', score: 85 },
                { name: 'May', score: 82 }, { name: 'Jun', score: 90 }
              ],
              recentInterviews: [
                { role: 'Frontend Developer', date: 'Today, 10:30 AM', duration: '45 mins' },
                { role: 'UI/UX Designer', date: 'Yesterday, 2:15 PM', duration: '60 mins' },
                { role: 'Full Stack Engineer', date: 'Aug 12, 2026', duration: '30 mins' },
                { role: 'Backend Developer', date: 'Aug 05, 2026', duration: '50 mins' }
              ]
            });
          })
          .finally(() => {
            setLoadingStats(false);
          });
      });
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user.avatar && !user.avatar.startsWith('blob:')) {
      setAvatar(user.avatar);
    } else {
      setAvatar(defaultAvatar);
    }
  }, [user.avatar, defaultAvatar]);

  const isAdminOrSuperAdmin = user?.roles?.includes('ROLE_ADMIN') || isSuperAdmin;
  const hasAudienceAccess = isAdminOrSuperAdmin || user?.permissions?.includes('user_read');
  const hasRoleAccess = isSuperAdmin || user?.permissions?.includes('role_manage');

  let sidebarItems = [
    { label: 'Dashboard', icon: Home, badge: 0 },
    { label: 'Interviews', icon: Video, badge: 3 },
    { label: 'Interview Reports', icon: MonitorPlay, badge: 0 },
    { label: 'Resume Review', icon: FileText, badge: 0 },
    { label: 'Analytics', icon: LineChartIcon, badge: 0 },
    { label: 'Community', icon: Globe, badge: 12 },
    ...(hasAudienceAccess ? [
      { label: 'Audience', icon: Users, badge: 0 }
    ] : []),
    ...(hasRoleAccess ? [
      { label: 'Assign Roles', icon: Shield, badge: 0 }
    ] : [])
  ];

  let accountItems = [
    { label: 'Settings', icon: Settings },
    { label: 'Help & Support', icon: LifeBuoy },
  ];

  // SuperAdmins now see everything including the Dashboard

  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-primary/20 selection:text-primary flex overflow-hidden font-sans">
      
      {/* Sidebar Navigation (Full Height) */}
      <aside 
        className={cn(
          "border-r border-border/40 bg-background flex-shrink-0 flex-col hidden md:flex relative transition-all duration-300 ease-in-out h-screen",
          sidebarCollapsed ? "w-12" : "w-52"
        )}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* User Profile Block */}
          <div className={cn("transition-all duration-300", sidebarCollapsed ? "p-1" : "p-4")}>
            <div 
              onClick={() => {}} // Could open a dropdown menu
              className={cn(
                "rounded-xl bg-secondary/40 border border-border/40 flex items-center cursor-pointer hover:bg-secondary/60 transition-colors",
                sidebarCollapsed ? "justify-center p-1" : "justify-between p-3"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden w-full">
                <div className="flex-shrink-0">
                  <Image 
                    src="/logo-light.png" 
                    alt="Edca Logo" 
                    width={32} 
                    height={32} 
                    className="block dark:hidden w-8 h-8 object-contain"
                  />
                  <Image 
                    src="/logo-dark.png" 
                    alt="Edca Logo" 
                    width={32} 
                    height={32} 
                    className="hidden dark:block w-8 h-8 object-contain"
                  />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col justify-center truncate">
                    <span className="text-base font-extrabold leading-tight tracking-tight uppercase">EDCA</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">Pro Plan</span>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
              )}
            </div>
          </div>
          
          {/* Main Navigation */}
          <div className="px-3 py-2 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    "w-full flex items-center justify-between py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap group",
                    sidebarCollapsed ? "px-0 justify-center" : "px-3",
                    isActive 
                      ? "bg-blue-600/10 text-blue-500" 
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
                    <div className="relative flex-shrink-0">
                      <item.icon className={cn(
                        "w-5 h-5 transition-colors",
                        isActive ? "text-blue-500" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      {item.badge > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full border-[1.5px] border-card"></span>
                      )}
                    </div>
                    {!sidebarCollapsed && <span className="animate-in fade-in duration-300">{item.label}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Account Section */}
          <div className="px-3 mt-6 mb-4">
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-3 px-3">
                Account
              </p>
            )}
            <div className="space-y-1">
              {accountItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.label === 'Settings' ? '/settings' : '#'}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    "w-full flex items-center py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap group",
                    sidebarCollapsed ? "px-0 justify-center" : "px-3 gap-3",
                    "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  {!sidebarCollapsed && <span className="animate-in fade-in duration-300">{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Hide Sidebar Button at Bottom */}
        <div className="p-4 border-t border-border/40">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-full",
              sidebarCollapsed ? "justify-center" : "gap-3 px-2"
            )}
            title={sidebarCollapsed ? "Expand Sidebar" : "Hide Sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronsLeft className="w-5 h-5" />
                <span>Hide</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-transparent">
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide" data-lenis-prevent onScroll={handleScroll}>
          {/* Top Header inside main area */}
          <header 
            className="px-8 py-6 flex items-start justify-between flex-shrink-0 transition-opacity duration-75"
            style={{ opacity: headerOpacity }}
          >
          <div>
            <h1 className="text-lg font-bold font-heading">{activeTab}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Welcome back to your dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-[10px] liquid-glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors relative cursor-pointer shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-[1.5px] border-card"></span>
            </button>
            <button 
              onClick={() => mounted && setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-[10px] liquid-glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer shadow-sm"
            >
              {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-8 h-8 rounded-[10px] liquid-glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer overflow-hidden shadow-sm ml-1"
              >
                 <img 
                   src={avatar} 
                   alt={username} 
                   className="w-full h-full object-cover"
                   referrerPolicy="no-referrer" 
                   onError={() => setAvatar(defaultAvatar)} 
                 />
              </button>
              
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-44 rounded-xl liquid-glass py-2 z-50 animate-in fade-in slide-in-from-top-2 text-left">
                  <div className="px-3 py-2.5 flex items-center gap-2.5 border-b border-border/40">
                    <img src={avatar} className="w-8 h-8 rounded-full object-cover border border-border/40" alt={username} />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold truncate text-foreground leading-tight">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : username}</span>
                      <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">{username}</span>
                    </div>
                  </div>
                  

                  <div className="px-2 py-1 flex flex-col gap-0.5">
                    <Link 
                      href={`/${username}`}
                      className="w-full flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      Profile
                    </Link>
                  </div>
                  <div className="h-px bg-border/40 my-1" />
                  
                  <div className="px-2 py-1 flex flex-col gap-0.5">
                    <Link href="/settings" className="w-full flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors cursor-pointer">
                      <Settings className="w-3.5 h-3.5" />
                      Settings
                    </Link>
                  </div>
                  <div className="h-px bg-border/40 my-1" />
                  
                  <div className="px-2 py-1">
                    <button 
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </header>

          <div className="max-w-7xl mx-auto h-full px-8 pb-8">
            {activeTab === 'Dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Interviews Taken', value: stats?.interviewsTaken ?? '...', icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Avg Interview Grade', value: stats?.avgGrade ?? '...', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    { label: 'Current Plan', value: stats?.currentPlan ?? '...', icon: Target, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Active Jobs', value: stats?.activeJobs ?? '...', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                  ].map((stat, i) => (
                    <div key={i} className="p-5 liquid-glass hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", stat.bg, stat.color)}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                          <h3 className="text-2xl font-bold text-foreground mt-0.5">{stat.value}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  {/* Performance Graph */}
                  <div className="lg:col-span-2 p-6 liquid-glass transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Overall Performance</h3>
                        <p className="text-sm text-muted-foreground">Your average interview scores over time</p>
                      </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats?.performanceData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                          />
                          <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="p-6 liquid-glass transition-all duration-300 flex flex-col h-full min-h-[396px]">
                     <h3 className="text-lg font-bold text-foreground mb-4 flex-shrink-0">Recent Activity</h3>
                     <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide">
                       {(stats?.recentInterviews || []).map((interview: any, idx: number) => (
                         <div key={idx} className="flex items-start gap-3 p-3 liquid-glass-subtle hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                           <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                             <Video className="w-5 h-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <h4 className="text-sm font-semibold text-foreground truncate">{interview.role}</h4>
                             <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                               <Calendar className="w-3 h-3" />
                               <span className="truncate">{interview.date || (interview.endedAt ? new Date(interview.endedAt).toLocaleDateString() : 'Recent')}</span>
                             </div>
                           </div>
                           <div className="text-xs font-medium text-foreground bg-secondary/80 px-2.5 py-1 rounded-md whitespace-nowrap border border-border/40">
                             {interview.durationMinutes ? `${interview.durationMinutes} mins` : interview.duration || 'N/A'}
                           </div>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'Interviews' && (
              <InterviewsSection />
            )}

            {activeTab === 'Audience' && hasAudienceAccess && (
              <AudienceSection />
            )}

            {activeTab === 'Assign Roles' && hasRoleAccess && (
              <AssignRolesSection />
            )}
            
            {activeTab !== 'Dashboard' && activeTab !== 'Interviews' && activeTab !== 'Audience' && activeTab !== 'Assign Roles' && (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 text-muted-foreground">
                  <Terminal className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{activeTab}</h2>
                <p className="text-muted-foreground max-w-md">
                  This section is currently under development. Check back soon for updates!
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
