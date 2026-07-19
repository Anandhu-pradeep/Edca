"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';

function OAuth2RedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore(state => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(errorParam);
      setTimeout(() => router.push('/sign'), 3000);
      return;
    }

    if (token) {
      // In a real scenario, you'd fetch user details from /api/v1/users/me using the token.
      // For now, we simulate user data or decode the JWT if we had a decoder.
      // Let's do a quick fetch to get user details if such endpoint exists, or just stub it.
      
      axiosInstance.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        const userData = response.data.data;
        setAuth(userData, token);
        router.push('/dashboard');
      }).catch(err => {
        console.error("Failed to fetch user data", err);
        // Fallback stub if /users/me is not implemented yet
        setAuth({ id: 'oauth', email: 'user@gmail.com', firstName: 'Google', lastName: 'User', roles: [], permissions: [] }, token);
        router.push('/dashboard');
      });
      
    } else {
      setError("No token found.");
      setTimeout(() => router.push('/sign'), 3000);
    }
  }, [searchParams, router, setAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <h2 className="text-2xl font-bold text-destructive mb-4">Authentication Failed</h2>
        <p>{error}</p>
        <p className="text-sm mt-4 text-muted-foreground">Redirecting back to sign in...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-medium">Securely logging you in...</h2>
      <p className="text-sm text-muted-foreground mt-2">Please wait a moment.</p>
    </div>
  );
}

export default function OAuth2RedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <OAuth2RedirectHandler />
    </Suspense>
  );
}
