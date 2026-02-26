"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requiredRole?: "student" | "agent";
    redirectTo?: string;
}

export default function AuthGuard({
    children,
    requireAuth = true,
    requiredRole,
    redirectTo = "/login"
}: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Wait for store to hydrate from localStorage
        const handle = requestAnimationFrame(() => {
            setIsLoading(false);
        });
        return () => cancelAnimationFrame(handle);
    }, []);

    useEffect(() => {
        if (isLoading) return;

        if (requireAuth && !isAuthenticated) {
            const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
            router.push(redirectUrl);
            return;
        }

        if (requiredRole && user?.role !== requiredRole) {
            // Redirect to appropriate dashboard based on actual role
            if (user?.role === "agent") {
                router.push("/agents/dashboard");
            } else if (user?.role === "student") {
                router.push("/dashboard");
            } else {
                router.push(redirectTo);
            }
        }
    }, [isAuthenticated, user, requireAuth, requiredRole, redirectTo, router, isLoading, pathname]);

    // Show loading while hydrating
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Don't render children if not authenticated or wrong role
    if (requireAuth && !isAuthenticated) {
        return null;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return null;
    }

    return <>{children}</>;
}
