"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Loader2, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import letterAnimation from '../../../public/letter.json';
import copyAnimation from '../../../public/Copy_aTFgMqI0mo.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

const registerDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterEmailValues = z.infer<typeof registerEmailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type RegisterDetailsValues = z.infer<typeof registerDetailsSchema>;

export default function SignPage() {
  const [view, setView] = useState<'login' | 'register-email' | 'register-otp' | 'register-details' | 'register-success'>('login');
  const [mounted, setMounted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const setAuth = useAuthStore(state => state.setAuth);
  const router = useRouter();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const registerEmailForm = useForm<RegisterEmailValues>({
    resolver: zodResolver(registerEmailSchema),
    defaultValues: { email: '' }
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  });

  const registerDetailsForm = useForm<RegisterDetailsValues>({
    resolver: zodResolver(registerDetailsSchema),
    defaultValues: { firstName: '', lastName: '', password: '' }
  });

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'register') {
      setView('register-email');
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!mounted) return null;

  const onLogin = async (data: LoginFormValues) => {
    setApiError(null);
    try {
      const response = await axiosInstance.post('/auth/login', data);
      const { accessToken } = response.data.data;
      setAuth({ id: 'stub', email: data.email, firstName: 'User', lastName: 'Name', roles: [], permissions: [] }, accessToken);
      router.push('/dashboard');
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Invalid email or password');
    }
  };

  const onRegisterEmail = async (data: RegisterEmailValues) => {
    setApiError(null);
    try {
      await axiosInstance.post('/auth/register/send-otp', { email: data.email });
      setRegisteredEmail(data.email);
      setCountdown(60);
      setView('register-otp');
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleResendOtp = async () => {
    setApiError(null);
    try {
      await axiosInstance.post('/auth/register/send-otp', { email: registeredEmail });
      setCountdown(60);
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const onVerifyOtp = async (data: OtpFormValues) => {
    setApiError(null);
    try {
      await axiosInstance.post('/auth/register/verify-otp', {
        email: registeredEmail,
        otp: data.otp
      });
      setView('register-details');
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const onRegisterDetails = async (data: RegisterDetailsValues) => {
    setApiError(null);
    try {
      await axiosInstance.post('/auth/register', {
        email: registeredEmail,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password
      });
      setView('register-success');
      setTimeout(() => {
        setView('login');
        loginForm.setValue('email', registeredEmail);
      }, 3000);
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleSwitchView = (newView: 'login' | 'register-email') => {
    setApiError(null);
    loginForm.reset();
    registerEmailForm.reset();
    otpForm.reset();
    registerDetailsForm.reset();
    setView(newView);
  };

  const leftClip = "polygon(0% 0%, 55% 0%, 35% 100%, 0% 100%)";
  const midClip = "polygon(25% 0%, 75% 0%, 75% 100%, 25% 100%)";
  const rightClip = "polygon(45% 0%, 100% 0%, 100% 100%, 65% 100%)";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-0 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/20 rounded-full blur-3xl" />
      </div>
      
      <Link href="/" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full h-screen bg-[#e0f2fe] dark:bg-card overflow-hidden shadow-2xl flex z-10"
      >
        {/* LEFT COLUMN: REGISTER FLOW */}
        <div className="absolute top-0 left-0 w-full md:w-[45%] h-full flex flex-col justify-center px-8 md:px-12 py-8 z-0">
          <AnimatePresence mode="wait">
            {view === 'register-email' && (
              <motion.div
                key="register-email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full max-w-md mx-auto"
              >
                <h3 className="text-3xl font-bold text-foreground mb-6 text-center md:text-left">Register</h3>
                
                {apiError && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium">{apiError}</div>}

                <form className="space-y-4" onSubmit={registerEmailForm.handleSubmit(onRegisterEmail)}>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        {...registerEmailForm.register('email')}
                        placeholder="Enter your email"
                        className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 outline-none transition-colors placeholder:text-foreground/30"
                      />
                      <Mail className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    </div>
                    {registerEmailForm.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1">{registerEmailForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={registerEmailForm.formState.isSubmitting}
                    className="w-full py-6 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-all mt-4"
                  >
                    {registerEmailForm.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                  </Button>
                </form>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#e0f2fe] dark:bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <Button variant="outline" className="w-full py-6 rounded-full border-border hover:bg-background transition-colors">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      Github
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full py-6 rounded-full border-border hover:bg-background transition-colors"
                      asChild
                    >
                      <a href="http://localhost:8080/oauth2/authorization/google">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          <path fill="transparent" d="M1 1h22v22H1z" />
                        </svg>
                        Google
                      </a>
                    </Button>
                  </div>
                </div>
                
                <div className="mt-8 text-center md:hidden">
                  <p className="text-sm opacity-80 mb-2">Already have an account?</p>
                  <button onClick={() => handleSwitchView('login')} className="text-primary font-semibold hover:underline">
                    Log In Here
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'register-otp' && (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full max-w-md mx-auto"
              >
                <h3 className="text-3xl font-bold text-foreground mb-2 text-center md:text-left">Check Email</h3>
                <p className="text-sm text-muted-foreground mb-6 text-center md:text-left">
                  We've sent a 6-digit code to {registeredEmail}.
                </p>
                <form className="space-y-4" onSubmit={otpForm.handleSubmit(onVerifyOtp)}>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Verification Code</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        maxLength={6}
                        {...otpForm.register('otp')}
                        placeholder="123456"
                        className="w-full bg-background border-2 border-border focus:border-primary text-foreground text-center text-3xl font-bold tracking-[0.5em] py-4 rounded-xl outline-none transition-colors placeholder:text-foreground/20 placeholder:tracking-normal placeholder:font-normal"
                      />
                    </div>
                    {otpForm.formState.errors.otp && (
                      <p className="text-xs text-destructive mt-1 text-center">{otpForm.formState.errors.otp.message}</p>
                    )}
                    {apiError && <p className="text-sm font-semibold text-destructive mt-2 text-center">{apiError}</p>}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={otpForm.formState.isSubmitting}
                    className="w-full py-6 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-all mt-4"
                  >
                    {otpForm.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                  </Button>
                </form>
                
                <div className="mt-6 text-center space-y-3">
                  {countdown > 0 ? (
                    <p className="text-sm text-muted-foreground font-medium">Resend OTP in {countdown}s</p>
                  ) : (
                    <button type="button" onClick={handleResendOtp} className="text-sm text-primary font-semibold hover:underline">
                      Resend Verification Code
                    </button>
                  )}
                  <p className="text-sm opacity-80">
                    Wrong email?{' '}
                    <button type="button" onClick={() => handleSwitchView('register-email')} className="text-primary font-semibold hover:underline">
                      Back to Register
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {view === 'register-details' && (
              <motion.div
                key="register-details-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full max-w-md mx-auto"
              >
                <h3 className="text-3xl font-bold text-foreground mb-2 text-center md:text-left">Almost Done</h3>
                <p className="text-sm text-muted-foreground mb-6 text-center md:text-left">
                  Set up your name and password.
                </p>
                
                {apiError && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium">{apiError}</div>}

                <form className="space-y-4" onSubmit={registerDetailsForm.handleSubmit(onRegisterDetails)}>
                  <div className="flex gap-4">
                    <div className="space-y-1 w-1/2">
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">First Name</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          {...registerDetailsForm.register('firstName')}
                          placeholder="First"
                          className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 outline-none transition-colors placeholder:text-foreground/30"
                        />
                        <User className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      </div>
                      {registerDetailsForm.formState.errors.firstName && (
                        <p className="text-xs text-destructive mt-1">{registerDetailsForm.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-1 w-1/2">
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Last Name</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          {...registerDetailsForm.register('lastName')}
                          placeholder="Last"
                          className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 outline-none transition-colors placeholder:text-foreground/30"
                        />
                        <User className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      </div>
                      {registerDetailsForm.formState.errors.lastName && (
                        <p className="text-xs text-destructive mt-1">{registerDetailsForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showRegisterPassword ? "text" : "password"}
                        {...registerDetailsForm.register('password')}
                        placeholder="Create a password"
                        className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 pr-10 outline-none transition-colors placeholder:text-foreground/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerDetailsForm.formState.errors.password && (
                      <p className="text-xs text-destructive mt-1">{registerDetailsForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={registerDetailsForm.formState.isSubmitting}
                    className="w-full py-6 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-all mt-4"
                  >
                    {registerDetailsForm.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
                  </Button>
                </form>
              </motion.div>
            )}

            {view === 'register-success' && (
              <motion.div
                key="register-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md mx-auto text-center flex flex-col items-center justify-center h-full"
              >
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">You're All Set!</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Your account has been created successfully.
                  <br />
                  <span className="text-sm">Redirecting to login...</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: LOGIN VIEW */}
        <div className="absolute top-0 right-0 w-full md:w-[45%] h-full flex flex-col justify-center px-8 md:px-12 py-8 z-0">
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full max-w-md mx-auto"
              >
                <h3 className="text-3xl font-bold text-foreground mb-6 text-center md:text-left">Log In</h3>
                
                {apiError && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium">{apiError}</div>}

                <form className="space-y-6" onSubmit={loginForm.handleSubmit(onLogin)}>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        {...loginForm.register('email')}
                        placeholder="Enter your email"
                        className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 outline-none transition-colors placeholder:text-foreground/30"
                      />
                      <Mail className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center pr-1">
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider ml-1">Password</label>
                      <Link href="/sign/forgot" className="text-xs text-primary hover:underline font-medium">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <input 
                        type={showLoginPassword ? "text" : "password"}
                        {...loginForm.register('password')}
                        placeholder="Enter your password"
                        className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground text-sm py-2 px-1 pr-10 outline-none transition-colors placeholder:text-foreground/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loginForm.formState.isSubmitting}
                    className="w-full py-6 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-all"
                  >
                    {loginForm.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
                  </Button>
                </form>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#e0f2fe] dark:bg-card px-2 text-muted-foreground">
                        Or log in with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <Button variant="outline" className="w-full py-6 rounded-full border-border hover:bg-background transition-colors">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      Github
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full py-6 rounded-full border-border hover:bg-background transition-colors"
                      asChild
                    >
                      <a href="http://localhost:8080/oauth2/authorization/google">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          <path fill="transparent" d="M1 1h22v22H1z" />
                        </svg>
                        Google
                      </a>
                    </Button>
                  </div>
                </div>
                
                <div className="mt-8 text-center md:hidden">
                  <p className="text-sm opacity-80 mb-2">Don't have an account?</p>
                  <button onClick={() => handleSwitchView('register-email')} className="text-primary font-semibold hover:underline">
                    Register Here
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* OVERLAY */}
        <motion.div 
          className="hidden md:flex absolute inset-0 bg-primary z-50 pointer-events-none"
          initial={false}
          animate={{ clipPath: view === 'login' ? [null, midClip, leftClip] : [null, midClip, rightClip] }}
          transition={{ duration: 0.8, times: [0, 0.5, 1], ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div 
                key="login-overlay"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 left-0 w-[45%] h-full flex flex-col justify-center px-12 text-primary-foreground pointer-events-auto"
              >
                <h2 className="text-4xl font-bold font-heading mb-4 uppercase tracking-wider">Welcome!</h2>
                <p className="text-sm opacity-90 leading-relaxed mb-8">
                  Log in to access your dashboard, connect with recruiters, and practice AI interviews.
                </p>
                <div className="text-center">
                  <p className="text-sm opacity-80 mb-2">Don't have an account?</p>
                  <button 
                    onClick={() => handleSwitchView('register-email')}
                    className="border-2 border-primary-foreground hover:bg-primary-foreground hover:text-primary text-primary-foreground rounded-full px-8 py-2 font-semibold transition-all"
                  >
                    Register
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {view !== 'login' && (
              <motion.div 
                key="register-overlay"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 right-0 w-[45%] h-full flex flex-col justify-center px-12 text-primary-foreground pointer-events-auto"
              >
                {view === 'register-email' && (
                  <>
                    <h2 className="text-4xl font-bold font-heading mb-4 uppercase tracking-wider text-right">
                      Hello!
                    </h2>
                    <p className="text-sm opacity-90 leading-relaxed mb-8 text-right">
                      Register today to begin your AI interview preparation journey with us.
                    </p>
                    <div className="text-center">
                      <p className="text-sm opacity-80 mb-2">Already have an account?</p>
                      <button 
                        onClick={() => handleSwitchView('login')}
                        className="border-2 border-primary-foreground hover:bg-primary-foreground hover:text-primary text-primary-foreground rounded-full px-8 py-2 font-semibold transition-all mt-4"
                      >
                        Log In
                      </button>
                    </div>
                  </>
                )}
                
                {view === 'register-otp' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg pointer-events-none">
                    <Lottie animationData={letterAnimation} loop={true} />
                  </div>
                )}
                
                {view === 'register-details' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg pointer-events-none">
                    <Lottie animationData={copyAnimation} loop={true} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

    </div>
  );
}
