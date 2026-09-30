"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { axiosInstance } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Loader2, Users } from 'lucide-react';

import { Suspense } from 'react';

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const classId = searchParams.get('classId');
  const orgId = searchParams.get('orgId');
  
  const { user, setActiveOrganization } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!classId || !orgId) {
      setError('Invalid invite link.');
    }
  }, [classId, orgId]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-8 bg-card border border-border/40 rounded-xl text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Join Class</h1>
          <p className="text-muted-foreground mb-6">You need to log in to accept this invitation.</p>
          <Button onClick={() => router.push('/sign')} className="w-full">
            Log In or Sign Up
          </Button>
        </div>
      </div>
    );
  }

  const handleJoin = async () => {
    if (!classId || !orgId) return;
    setLoading(true);
    setError('');
    
    try {
      await axiosInstance.post(`/organizations/${orgId}/classes/${classId}/join-via-link`);
      // Optional: Set active organization to the joined org
      try {
        const orgsRes = await axiosInstance.get('/organizations/my');
        const joinedOrg = orgsRes.data.find((o: any) => o.id === orgId);
        if (joinedOrg) {
          setActiveOrganization(joinedOrg);
        }
      } catch(e) {
         console.error("Failed to set active org", e);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join class. You might already be a member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card border border-border/40 rounded-xl text-center animate-in fade-in zoom-in-95 duration-300">
        <Users className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Join Class</h1>
        <p className="text-muted-foreground mb-6">
          You've been invited to join an organization and class. Click the button below to confirm.
        </p>
        
        {error && (
          <div className="p-3 mb-6 bg-red-500/10 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Button 
          onClick={handleJoin} 
          disabled={loading || !!error}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            'Confirm Join'
          )}
        </Button>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <InviteContent />
    </Suspense>
  );
}
