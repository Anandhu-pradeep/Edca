"use client";

import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { wsClient } from '@/lib/websocket';
import { Laptop, Smartphone, Globe, LogOut, Loader2, User, Shield, Sliders, AlertTriangle, Trash2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import EditProfileForm from '@/components/settings/EditProfileForm';
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";
import ThemePreferences from "@/components/settings/ThemePreferences";

interface Session {
  id: string;
  ipAddress: string;
  device: string;
  browser: string;
  operatingSystem: string;
  loginTime: string;
}

export default function SettingsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'preferences' | 'danger'>('account');
  const [deleting, setDeleting] = useState(false);
  
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/sign');
      return;
    }

    wsClient.connect();

    const fetchSessions = async () => {
      try {
        const response = await axiosInstance.get('/sessions');
        setSessions(response.data.data);
      } catch (error) {
        console.error('Failed to fetch sessions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, router]);

  const handleRevokeSession = async (id: string) => {
    try {
      await axiosInstance.delete(`/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to revoke session', error);
    }
  };

  const handleGlobalLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      wsClient.disconnect();
      logout();
    } catch (error) {
      console.error('Failed to logout', error);
      logout();
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) return;
    
    setDeleting(true);
    try {
      await axiosInstance.delete('/users/me');
      wsClient.disconnect();
      logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const tabs = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ] as const;

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
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
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-1 bg-background p-4 rounded-2xl border border-border shadow-sm h-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? tab.id === 'danger' 
                      ? 'bg-red-500/10 text-red-500' 
                      : 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id && tab.id === 'danger' ? 'text-red-500' : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            
            {/* Account Settings */}
            {activeTab === 'account' && (
              <EditProfileForm />
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Security & Sessions</h2>
                  <p className="text-muted-foreground text-sm">Manage your account security and view active sessions.</p>
                </div>

                {user?.authProvider === 'LOCAL' ? (
                  <ChangePasswordForm />
                ) : (
                  <div className="liquid-glass p-6 mb-6 flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-500 shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Managed by Google</h3>
                      <p className="text-sm text-muted-foreground">You signed in using your Google account. Your password and authentication are securely managed by Google.</p>
                    </div>
                  </div>
                )}

                <div className="liquid-glass p-6">
                   <div className="flex justify-between items-start mb-6">
                     <div>
                       <h3 className="text-lg font-semibold mb-1">Active Sessions</h3>
                       <p className="text-sm text-muted-foreground">These devices are currently logged into your account.</p>
                     </div>
                     <Button variant="outline" className="liquid-glass-subtle" onClick={handleGlobalLogout}>
                       Logout Current Device
                     </Button>
                   </div>
                   
                   <div className="space-y-3">
                     {sessions.length === 0 ? (
                       <p className="text-muted-foreground text-sm">No active sessions found.</p>
                     ) : (
                       sessions.map((session) => (
                         <div key={session.id} className="flex items-center justify-between p-4 liquid-glass-subtle hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                           <div className="flex items-center gap-4">
                             <div className="p-3 bg-primary/10 rounded-full text-primary">
                               {session.device === 'Mobile' ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                             </div>
                             <div>
                               <p className="font-medium text-foreground text-sm">
                                 {session.operatingSystem} • {session.browser}
                               </p>
                               <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                 <Globe className="w-3 h-3" /> {session.ipAddress} • Logged in: {new Date(session.loginTime).toLocaleDateString()}
                               </p>
                             </div>
                           </div>
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                             onClick={() => handleRevokeSession(session.id)}
                           >
                             <LogOut className="w-4 h-4 mr-2" />
                             Revoke
                           </Button>
                         </div>
                       ))
                     )}
                   </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <ThemePreferences />
            )}

            {/* Danger Zone */}
            {activeTab === 'danger' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold text-red-500 mb-1">Danger Zone</h2>
                  <p className="text-muted-foreground text-sm">Destructive actions that cannot be reversed.</p>
                </div>
                
                <div className="border border-red-500/30 bg-red-500/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/20 rounded-full text-red-500 shrink-0">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">Delete Account</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all of your data. This action is not reversible, so please be certain.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                      >
                        {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Yes, Delete My Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
