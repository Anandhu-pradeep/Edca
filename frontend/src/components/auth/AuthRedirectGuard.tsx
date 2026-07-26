"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { axiosInstance } from "@/lib/axios";

function GuardHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isInitializing, setAuth } = useAuthStore();

  useEffect(() => {
    // 1. If Google OAuth redirected to root `/` with token parameters instead of `/oauth2/redirect`
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      router.replace(`/sign?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    if (token) {
      axiosInstance
        .get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const userData = response.data.data;
          const onboarded = Boolean(userData?.isOnboarded);
          setAuth(userData, token);
          router.replace(onboarded ? "/" : "/onboarding");
        })
        .catch((err) => {
          console.error("Profile verification failed on landing page redirect", err);
          router.replace("/sign");
        });
      return;
    }

    // 2. If already logged in and visiting the landing page, automatically redirect to dashboard/onboarding
    if (!isInitializing && isAuthenticated && user) {
      router.replace(user.isOnboarded ? "/" : "/onboarding");
    }
  }, [searchParams, isAuthenticated, user, isInitializing, router, setAuth]);

  return null;
}

export function AuthRedirectGuard() {
  return (
    <Suspense fallback={null}>
      <GuardHandler />
    </Suspense>
  );
}
