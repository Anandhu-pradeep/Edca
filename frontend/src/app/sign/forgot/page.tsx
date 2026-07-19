"use client";

import { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { axiosInstance } from '@/lib/axios';

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setApiError(null);
    try {
      await axiosInstance.post('/auth/forgot-password', data);
      setSuccess(true);
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </div>
      
      <Link href="/sign?view=login" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>

      <div className="relative w-full max-w-md bg-card rounded-2xl overflow-hidden border border-border shadow-2xl p-8 z-10">
        <h3 className="text-2xl font-bold text-foreground mb-2">Forgot Password</h3>
        
        {success ? (
          <div className="flex flex-col items-center text-center space-y-4 py-6">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="text-muted-foreground">If an account exists for that email, we have sent a password reset link.</p>
            <Button onClick={() => setSuccess(false)} variant="outline" className="mt-4">
              Try another email
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {apiError && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium">{apiError}</div>}

            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    {...form.register('email')}
                    placeholder="Enter your email"
                    className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 outline-none transition-colors placeholder:text-foreground/30"
                  />
                  <Mail className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="w-full py-6 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-all"
              >
                {form.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
