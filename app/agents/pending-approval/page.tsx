"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, CheckCircle2, Home, LogOut, CreditCard, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { loadPaystack } from "@/app/utils/paystack";

export default function PendingApprovalPage() {
    const router = useRouter();
    const { user, logout, isAuthenticated, updateUser } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [payError, setPayError] = useState("");

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (isMounted) {
            if (!isAuthenticated || !user) {
                router.push("/login");
            } else if (user.role !== "agent") {
                router.push("/dashboard");
            } else if (user.verificationStatus === "APPROVED") {
                router.push("/agents/dashboard");
            }
        }
    }, [isMounted, isAuthenticated, user, router]);

    if (!isMounted || !user) return null;

    const feePaid = (user as any).verificationFeePaid;

    const handlePayFee = async () => {
        setPayError("");
        setIsPaymentLoading(true);
        try {
            await loadPaystack();
        } catch {
            setPayError("Failed to load payment processor. Please try again.");
            setIsPaymentLoading(false);
            return;
        }

        const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
        const PaystackPop = (window as any).PaystackPop;
        if (!PaystackPop) {
            setPayError("Payment processor unavailable. Please refresh and try again.");
            setIsPaymentLoading(false);
            return;
        }

        const handler = PaystackPop.setup({
            key: paystackKey,
            email: user.email,
            amount: 100000,
            currency: "NGN",
            ref: `agent-verify-${user.id}-${Date.now()}`,
            callback: function (response: any) { handlePaymentSuccess(response); },
            onClose: function () { setIsPaymentLoading(false); },
            onSuccess: function (response: any) { handlePaymentSuccess(response); },
        });
        handler.openIframe();
    };

    const handlePaymentSuccess = async (response: any) => {
        try {
            const ref = response?.reference || response?.trxref;
            await api.post("/auth/confirm-verification-fee", { reference: ref });
            updateUser({ ...(user as any), verificationFeePaid: true });
        } catch (err) {
            console.error("Fee confirmation error:", err);
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const steps = [
        { label: "Account Created", done: true },
        { label: "NIN Submitted", done: !!user.verificationStatus && user.verificationStatus !== "UNVERIFIED" },
        { label: "Verification Fee Paid (₦1,000)", done: feePaid },
        { label: "Admin Approval", done: user.verificationStatus === "APPROVED" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                            <Home size={20} />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">IGLOO</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Top banner */}
                    <div className="bg-green-600 p-8 text-center">
                        <motion.div
                            animate={{ rotate: [0, -5, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                        >
                            <Clock size={36} className="text-green-600" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2">Application Under Review</h1>
                        <p className="text-green-100 text-sm">Your agent account is pending admin approval</p>
                    </div>

                    <div className="p-8">
                        {/* Agent info */}
                        <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold shrink-0">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <span className="ml-auto text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                                Pending
                            </span>
                        </div>

                        {/* Progress steps */}
                        <div className="space-y-3 mb-6">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Verification Progress</p>
                            {steps.map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    {step.done ? (
                                        <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                                    )}
                                    <span className={`text-sm ${step.done ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Pay fee CTA if not paid */}
                        {!feePaid && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                                <div className="flex gap-2 mb-3">
                                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-800">Verification Fee Required</p>
                                        <p className="text-xs text-amber-700 mt-0.5">Your application won&apos;t be reviewed until the ₦1,000 fee is paid.</p>
                                    </div>
                                </div>
                                {payError && <p className="text-xs text-red-600 mb-2">{payError}</p>}
                                <button
                                    onClick={handlePayFee}
                                    disabled={isPaymentLoading}
                                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition text-sm"
                                >
                                    {isPaymentLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CreditCard size={16} />
                                            Pay ₦1,000 Verification Fee
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Verified steps info */}
                        {feePaid && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex gap-2">
                                <ShieldCheck size={18} className="text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-green-800">Verification fee paid!</p>
                                    <p className="text-xs text-green-700 mt-0.5">Our admin team will review your application and NIN details. You&apos;ll receive access once approved — typically within 24–48 hours.</p>
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-center text-gray-400 mb-6">
                            Questions? Contact us at{" "}
                            <a href="mailto:support@igloo.ng" className="text-green-600 hover:underline font-medium">support@igloo.ng</a>
                        </p>

                        <button
                            onClick={() => { logout(); router.push("/login"); }}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition"
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
