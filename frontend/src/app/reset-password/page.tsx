"use client";

import { useState, Suspense } from 'react';
import { Lock, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { axiosInstance } from '@/lib/axios';
import { useSearchParams, useRouter } from 'next/navigation';

const resetSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' }
  });

  const onSubmit = async (data: ResetFormValues) => {
    if (!token) {
      setApiError("Invalid or missing reset token.");
      return;
    }

    setApiError(null);
    try {
      await axiosInstance.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword
      });
      setSuccess(true);
    } catch (error: any) {
      let msg = error.response?.data?.message || 'An error occurred. Please try again.';
      if (msg.includes('Invalid reset token') || msg.includes('expired')) {
        msg = 'This password reset link has expired or has already been used.';
      }
      setApiError(msg);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-6">
        <p className="text-destructive font-medium">Invalid or missing reset token.</p>
        <p className="text-muted-foreground text-sm">Please make sure you clicked the exact link from your email.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/sign/forgot">Request new link</Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-6">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <p className="text-foreground font-medium text-lg">Password Reset Successfully!</p>
        <p className="text-muted-foreground text-sm">You can now log in with your new password.</p>
        <Button onClick={() => router.push('/sign?view=login')} className="mt-6 bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 w-full rounded-full py-6">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-6">
        Enter your new password below to reset it.
      </p>

      {apiError && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium">{apiError}</div>}

      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">New Password</label>
          <div className="relative">
            <input 
              type={showNewPassword ? "text" : "password"}
              {...form.register('newPassword')}
              placeholder="Enter new password"
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 pr-10 outline-none transition-colors placeholder:text-foreground/30"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.formState.errors.newPassword && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Confirm Password</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"}
              {...form.register('confirmPassword')}
              placeholder="Confirm new password"
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 pr-10 outline-none transition-colors placeholder:text-foreground/30"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          className="w-full py-6 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-all"
        >
          {form.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
        <h3 className="text-2xl font-bold text-foreground mb-2">Reset Password</h3>
        <Suspense fallback={<div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
