"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { axiosInstance } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Organizations } from "@/components/landing/Organizations";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

function HomeHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isInitializing, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      router.replace(`/sign?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    if (token) {
      setVerifyingToken(true);
      axiosInstance
        .get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const userData = response.data.data;
          const onboarded = Boolean(userData?.isOnboarded);
          setAuth(userData, token);
          if (!onboarded) {
            router.replace("/onboarding");
          } else {
            router.replace("/");
          }
        })
        .catch((err) => {
          console.error("Profile verification failed", err);
          router.replace("/sign");
        })
        .finally(() => {
          setVerifyingToken(false);
        });
      return;
    }

    // If logged in but not onboarded, redirect to onboarding
    if (!isInitializing && isAuthenticated && user) {
      if (!user.isOnboarded) {
        router.replace("/onboarding");
      }
    }
  }, [searchParams, isAuthenticated, user, isInitializing, mounted, router, setAuth]);

  if (!mounted || isInitializing || verifyingToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading EDCA...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and onboarded, render the Dashboard directly on localhost:3000/
  if (isAuthenticated && user) {
    if (user.isOnboarded) {
      return <DashboardContent />;
    }
  }

  // Otherwise, render Landing Page
  return (
    <main className="min-h-screen bg-background selection:bg-white/20 selection:text-white">
      <Navbar />
      <Hero />
      <Features />
      <DashboardPreview />
      <Organizations />
      <FAQ />
      <Pricing />
      <Footer />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <HomeHandler />
    </Suspense>
  );
}
