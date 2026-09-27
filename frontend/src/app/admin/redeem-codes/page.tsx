"use client";

import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, ArrowLeft, Copy, CheckCircle2, Ticket, Ban, List } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RedeemCode {
  id: string;
  code?: string;
  credits: number;
  expiresAt: string | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  perUserLimit: number;
  status: string;
  createdAt: string;
}

export default function AdminRedeemCodesPage() {
  const user = useAuthStore(state => state.user);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  // Form State
  const [credits, setCredits] = useState(500);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState(100);
  const [perUserLimit, setPerUserLimit] = useState(1);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/sign');
    } else if (!user.roles?.includes('SUPER_ADMIN') && !user.permissions?.includes('redeem_code:create')) {
      // Basic check, actual check should be server side too
      // router.push('/dashboard'); 
    }
  }, [user, router]);

  const { data: codes, isLoading } = useQuery({
    queryKey: ['admin-redeem-codes'],
    queryFn: async () => {
      const res = await axiosInstance.get('/redeem-codes');
      return res.data as RedeemCode[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post('/redeem-codes', data);
      return res.data;
    },
    onSuccess: (data) => {
      setGeneratedCode(data.code);
      queryClient.invalidateQueries({ queryKey: ['admin-redeem-codes'] });
    }
  });

  const disableMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.patch(`/redeem-codes/${id}/disable`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-redeem-codes'] });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      credits,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      maxRedemptions: maxRedemptions > 0 ? maxRedemptions : null,
      perUserLimit
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold font-heading">Redeem Codes</h1>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? <List className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showCreate ? 'View Codes' : 'Create Code'}
          </Button>
        </div>

        {showCreate ? (
          <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Generate New Redeem Code
            </h2>
            
            {generatedCode ? (
              <div className="space-y-6 text-center">
                <div className="p-8 border border-primary/20 bg-primary/5 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-4">Your redeem code is ready. Copy it now, it won't be shown again.</p>
                  <div className="text-3xl font-mono tracking-[0.2em] font-bold text-foreground mb-6 break-all">
                    {generatedCode}
                  </div>
                  <Button onClick={copyToClipboard} variant="secondary" className="w-full sm:w-auto">
                    {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>
                </div>
                <Button variant="outline" onClick={() => { setGeneratedCode(''); setShowCreate(false); }}>
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Credits</label>
                  <Input type="number" min={1} value={credits} onChange={e => setCredits(parseInt(e.target.value))} required />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiration (Optional)</label>
                  <Input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Redemptions (0 = unlimited)</label>
                    <Input type="number" min={0} value={maxRedemptions} onChange={e => setMaxRedemptions(parseInt(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Per-User Limit</label>
                    <Input type="number" min={1} value={perUserLimit} onChange={e => setPerUserLimit(parseInt(e.target.value))} required />
                  </div>
                </div>

                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Generate Redeem Code
                </Button>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-secondary/50 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID / Hash</th>
                    <th className="px-6 py-4 font-medium">Credits</th>
                    <th className="px-6 py-4 font-medium">Used / Limit</th>
                    <th className="px-6 py-4 font-medium">Expires</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {codes?.map(code => (
                    <tr key={code.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {code.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary">
                        +{code.credits}
                      </td>
                      <td className="px-6 py-4">
                        {code.redemptionCount} / {code.maxRedemptions || '∞'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          code.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' :
                          code.status === 'DISABLED' ? 'bg-red-500/10 text-red-500' :
                          code.status === 'EXHAUSTED' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {code.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {code.status === 'ACTIVE' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to disable this code?")) {
                                disableMutation.mutate(code.id);
                              }
                            }}
                            disabled={disableMutation.isPending}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Disable
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {codes?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No redeem codes found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
