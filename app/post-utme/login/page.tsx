"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { toast } from "@/app/stores/useToastStore";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Home } from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/common/Button";
import Image from "next/image";
import { igloo } from "../../assets";

function PostUtmeLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect");
    const roleParam = searchParams.get("role");
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
                // Default redirect based on role
                const user = useAuthStore.getState().user;
                if (user?.role === 'renter') {
                    router.push("/dashboard/renter");
                } else {
                    router.push("/post-utme");
                }
            }
        } else {
            setError(result.error || "Login failed");
            toast.error(result.error || "Login failed");
            setIsLoading(false);
        }
    };

    const signupRedirectQuery = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : "";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl bg-[#008489]/10"></div>
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
                    <Link href="/post-utme" className="inline-flex items-center gap-2 mb-4">
                        <div className="bg-[#008489] text-white text-xs font-black px-2 py-1 rounded-lg">POST-UTME PORTAL</div>
                        <Image src={igloo} width={100} height={30} alt="logo" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {roleParam === "renter" ? "Landlord Login" : "Student Login"}
                    </h1>
                    <p className="text-gray-600 text-sm">
                        {roleParam === "renter"
                            ? "Sign in to manage your listings and bookings"
                            : "Sign in to book your short-stay accommodation"}
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
                                    placeholder="your-email@example.com"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008489] focus:border-transparent transition"
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
                                    placeholder="Enter your password"
                                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008489] focus:border-transparent transition"
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

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#008489] hover:bg-[#006b6e] text-white border-none"
                            size="lg"
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>

                    {/* Registration Redirect Links */}
                    <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-3">
                        <p className="text-xs text-gray-500 font-medium">DON'T HAVE AN ACCOUNT?</p>
                        <div className="flex flex-col gap-2">
                            <Link 
                                href={`/post-utme/student-signup${signupRedirectQuery}`}
                                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border border-[#008489]/20 text-[#008489] hover:bg-[#008489]/5 transition"
                            >
                                Register as a Student (to book)
                            </Link>
                            <Link 
                                href={`/post-utme/signup${signupRedirectQuery}`}
                                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                            >
                                Register as a Landlord (to list)
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Back to Marketplace */}
                <div className="text-center mt-6">
                    <Link href="/post-utme" className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center justify-center gap-1.5">
                        <Home size={14} /> Back to Post-UTME Marketplace
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function PostUtmeLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008489]"></div>
            </div>
        }>
            <PostUtmeLoginForm />
        </Suspense>
    );
}
