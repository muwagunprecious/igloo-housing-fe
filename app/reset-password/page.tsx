"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/common/Button";
import { igloo } from "../assets"; 
import Image from "next/image";
import api from "@/app/lib/axios";
import { toast } from "@/app/stores/useToastStore";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            // Call the backend route
            await api.post("/auth/reset-password", { token, newPassword: password });
            setIsSuccess(true);
            toast.success("Password reset successfully!");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password. The link might have expired.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token && !isSuccess) {
        return (
            <div className="text-center z-10 relative">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h2>
                <p className="text-gray-600 mb-6">This password reset link is invalid or missing.</p>
                <Link href="/forgot-password">
                    <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white">Request New Link</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md relative z-10">
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-4">
                    <Image src={igloo} width={100} height={30} alt="logo" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h1>
                <p className="text-gray-600">Please enter your new strong password</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
                {isSuccess ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All Done!</h3>
                        <p className="text-gray-600 mb-6">Your password has been reset successfully. You can now log in with your new password.</p>
                        <Link href="/login" className="block w-full">
                            <Button className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white">
                                Continue to Login
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* New Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent transition"
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

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${
                                        confirmPassword && password !== confirmPassword 
                                        ? "border-red-300 focus:ring-red-500" 
                                        : "border-gray-300 focus:ring-[#dc2626]"
                                    }`}
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !password || password !== confirmPassword}
                            className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white border-none"
                        >
                            {isLoading ? "Saving..." : "Reset Password"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

// Wrapping in Suspense because we use useSearchParams()
export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>
            
            <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dc2626] relative z-10"></div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}