"use client";

import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { wsClient } from '@/lib/websocket';
import { Laptop, Smartphone, Globe, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-12 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">Security Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account security and active sessions.</p>
        </div>
        <Button variant="destructive" onClick={handleGlobalLogout}>
          Logout (Current Device)
        </Button>
      </div>

      <div className="space-y-8">
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Active Sessions</h2>
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-muted-foreground">No active sessions found.</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                      {session.device === 'Mobile' ? <Smartphone className="w-6 h-6" /> : <Laptop className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {session.operatingSystem} • {session.browser}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Globe className="w-3 h-3" /> {session.ipAddress} • Logged in: {new Date(session.loginTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Revoke
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
           <h2 className="text-xl font-semibold mb-4">Password Policy</h2>
           <p className="text-muted-foreground mb-4">Your password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character. You cannot reuse your last 5 passwords.</p>
           <Button variant="secondary">Change Password</Button>
        </section>
      </div>
    </div>
  );
}
