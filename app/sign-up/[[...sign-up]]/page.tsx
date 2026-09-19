"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { GraduationCap, Building2, ArrowRight, ShieldCheck, Search, CheckCircle2, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { igloo } from "@/app/assets";
import { motion } from "framer-motion";

function SignUpContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const roleParam = searchParams.get("role") as "student" | "agent" | null;

    const [selectedRole, setSelectedRole] = useState<"student" | "agent" | null>(null);

    useEffect(() => {
        if (roleParam === "agent" || roleParam === "student") {
            setSelectedRole(roleParam);
            if (typeof window !== "undefined") {
                sessionStorage.setItem("igloo_pending_role", roleParam);
            }
        } else if (typeof window !== "undefined") {
            const stored = sessionStorage.getItem("igloo_pending_role") as "student" | "agent" | null;
            if (stored === "agent" || stored === "student") {
                setSelectedRole(stored);
            }
        }
    }, [roleParam]);

    const handleSelectRole = (role: "student" | "agent") => {
        setSelectedRole(role);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("igloo_pending_role", role);
        }
        router.push(`/sign-up?role=${role}`);
    };

    const handleSwitchRole = () => {
        setSelectedRole(null);
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("igloo_pending_role");
        }
        router.push("/sign-up");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Igloo Header */}
            <div className="text-center mb-6 z-10">
                <Link href="/" className="inline-flex items-center gap-2 mb-3 hover:opacity-90 transition">
                    <Image src={igloo} width={100} height={32} alt="Igloo logo" priority />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {selectedRole === "agent"
                        ? "Join as a Verified Agent"
                        : selectedRole === "student"
                        ? "Create Student Account"
                        : "Join Igloo"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    {selectedRole === "agent"
                        ? "List student properties, connect with verified students, and manage listings."
                        : selectedRole === "student"
                        ? "Discover verified off-campus apartments, find compatible roommates, and book inspections."
                        : "Select your account type to get started with Nigeria's #1 student housing marketplace."}
                </p>
            </div>

            {/* STEP 1: If No Role is Selected Yet, Display Role Selection Modal/Cards */}
            {!selectedRole && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 z-10"
                >
                    <div className="text-center mb-6">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                            Step 1 of 2
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-3">
                            Are you a Student or an Agent?
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Choose how you want to use Igloo so we can tailor your experience.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Option 1: Normal User / Student */}
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectRole("student")}
                            className="group p-5 rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-left flex items-start gap-4 shadow-xs hover:shadow-md"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <GraduationCap size={26} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 text-base group-hover:text-primary transition-colors">
                                        Normal User / Student
                                    </h3>
                                    <ArrowRight size={18} className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Looking for verified student apartments, rooms, or finding roommates near your campus.
                                </p>
                                <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Search size={12} className="text-primary" /> Browse houses
                                    </span>
                                    <span>•</span>
                                    <span>Find roommates</span>
                                    <span>•</span>
                                    <span>Contact agents</span>
                                </div>
                            </div>
                        </div>

                        {/* Option 2: Verified Agent / Host */}
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectRole("agent")}
                            className="group p-5 rounded-2xl border-2 border-gray-200 hover:border-green-600 hover:bg-green-50/50 transition-all cursor-pointer text-left flex items-start gap-4 shadow-xs hover:shadow-md"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Building2 size={26} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 text-base group-hover:text-green-700 transition-colors">
                                            Verified Agent / Host
                                        </h3>
                                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                            Host
                                        </span>
                                    </div>
                                    <ArrowRight size={18} className="text-gray-400 group-hover:text-green-700 group-hover:translate-x-1 transition-all" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Property owner or real estate agent listing student accommodation and connecting with tenants.
                                </p>
                                <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500 font-medium">
                                    <span className="flex items-center gap-1 text-green-700">
                                        <ShieldCheck size={12} /> NIN + ₦1,000 Verification
                                    </span>
                                    <span>•</span>
                                    <span>Upload listings</span>
                                    <span>•</span>
                                    <span>Manage inquiries</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Already have an account link */}
                    <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500">
                            Already have an account?{" "}
                            <Link href="/sign-in" className="text-primary font-bold hover:underline">
                                Sign In with Clerk
                            </Link>
                        </p>
                    </div>
                </motion.div>
            )}

            {/* STEP 2: Render Clerk SignUp with Selected Role Context */}
            {selectedRole && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md z-10 flex flex-col items-center"
                >
                    {/* Role Indicator Banner */}
                    <div className={`w-full mb-4 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold border ${
                        selectedRole === "agent"
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-blue-50 border-blue-200 text-blue-800"
                    }`}>
                        <div className="flex items-center gap-2">
                            {selectedRole === "agent" ? (
                                <>
                                    <ShieldCheck size={16} className="text-green-600 shrink-0" />
                                    <span>Signing up as <strong>Verified Agent</strong></span>
                                </>
                            ) : (
                                <>
                                    <GraduationCap size={16} className="text-blue-600 shrink-0" />
                                    <span>Signing up as <strong>Student / Normal User</strong></span>
                                </>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleSwitchRole}
                            className="text-[11px] font-bold underline hover:opacity-75 flex items-center gap-1 cursor-pointer"
                        >
                            <RefreshCw size={11} /> Switch
                        </button>
                    </div>

                    {/* Agent Notice regarding NIN & Paystack Fee */}
                    {selectedRole === "agent" && (
                        <div className="w-full mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-[12px] text-amber-800 flex items-start gap-2.5">
                            <span className="text-base leading-none">ℹ️</span>
                            <div>
                                <strong className="font-bold">Agent Verification Step:</strong>
                                <p className="text-[11px] text-amber-700 mt-0.5">
                                    Immediately after creating your Clerk account, you will enter your 11-digit NIN and pay the ₦1,000 verification fee.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Clerk SignUp Component */}
                    <div className="w-full flex justify-center">
                        <SignUp
                            fallbackRedirectUrl={`/auth/clerk-callback?role=${selectedRole}`}
                            signInUrl="/sign-in"
                        />
                    </div>

                    <div className="text-center mt-4">
                        <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 transition font-medium">
                            ← Back to home
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        }>
            <SignUpContent />
        </Suspense>
    );
}
