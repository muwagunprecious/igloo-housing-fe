"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { toast } from "@/app/stores/useToastStore";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/common/Button";
import { igloo } from "../assets";
import Image from "next/image";
import { cn } from "@/app/utils/cn";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect");
    const isPostUtme = false;
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const result = await login(email.trim(), password.trim());

        if (result.success) {
            toast.success("Welcome back!");
            if (redirectPath) {
                router.push(decodeURIComponent(redirectPath));
            } else if (result.redirectTo) {
                router.push(result.redirectTo);
            } else {
                router.push("/dashboard");
            }
        } else {
            setError(result.error || "Login failed");
            toast.error(result.error || "Login failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={cn(
                    "absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl",
                    isPostUtme ? "bg-[#008489]/10" : "bg-primary/10"
                )}></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href={isPostUtme ? "/post-utme" : "/"} className="inline-flex items-center gap-2 mb-4">
                        {isPostUtme && (
                            <div className="bg-[#008489] text-white text-xs font-black px-2 py-1 rounded-lg">POST-UTME</div>
                        )}
                        <Image src={igloo} width={100} height={30} alt="logo" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={isPostUtme ? "agent@igloo.com" : "student@igloo.com"}
                                    className={cn(
                                        "w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition",
                                        isPostUtme ? "focus:ring-[#008489]" : "focus:ring-primary"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={cn(
                                        "w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition",
                                        isPostUtme ? "focus:ring-[#008489]" : "focus:ring-primary"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className={cn(
                                        "w-4 h-4 rounded focus:ring-2",
                                        isPostUtme ? "text-[#008489] border-gray-300 focus:ring-[#008489]" : "text-primary border-gray-300 focus:ring-primary"
                                    )}
                                />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link 
                                href="/forgot-password" 
                                className={cn(
                                    "text-sm font-semibold hover:underline",
                                    isPostUtme ? "text-[#008489]" : "text-primary"
                                )}
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full",
                                isPostUtme && "bg-[#008489] hover:bg-[#006b6e] text-white border-transparent"
                            )}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-wider">
                            <span className="px-4 bg-white text-gray-400 font-semibold">Or use Clerk</span>
                        </div>
                    </div>

                    {/* Continue with Clerk */}
                    <div>
                        <Link href="/sign-in" className="w-full">
                            <button
                                type="button"
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-bold text-sm transition cursor-pointer shadow-xs"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 16H9V8H11V16ZM15 16H13V8H15V16Z" fill="#6C47FF"/>
                                </svg>
                                Continue with Clerk (Google / Email)
                            </button>
                        </Link>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Don&apos;t have an account?{" "}
                        <Link 
                            href="/sign-up" 
                            className="font-bold hover:underline text-primary"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link href={isPostUtme ? "/post-utme" : "/"} className="text-sm text-gray-600 hover:text-gray-900 transition">
                        ← Back to {isPostUtme ? "Post-UTME" : "home"}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <LoginForm />
        </Suspense>
    );
}
