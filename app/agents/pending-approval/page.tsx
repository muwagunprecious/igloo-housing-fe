"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { 
    CheckCircle2, 
    CreditCard, 
    LogOut, 
    Shield, 
    Clock, 
    AlertCircle, 
    Lock,
    ExternalLink,
    HelpCircle,
    FileCheck2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import api from "@/app/lib/axios";
import { loadPaystack } from "@/app/utils/paystack";
import { igloo } from "@/app/assets";

export default function PendingApprovalPage() {
    const router = useRouter();
    const { user, logout, isAuthenticated, updateUser } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [payError, setPayError] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

    const feePaid = Boolean(user.verificationFeePaid);
    const hasNin = Boolean(user.nin);

    const handlePayFee = async () => {
        setPayError("");
        setIsPaymentLoading(true);
        try {
            await loadPaystack();
        } catch {
            setPayError("Unable to load secure payment processor. Please check your connection.");
            setIsPaymentLoading(false);
            return;
        }

        const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
        const PaystackPop = (window as any).PaystackPop;
        if (!PaystackPop) {
            setPayError("Payment service is currently unavailable. Please refresh and try again.");
            setIsPaymentLoading(false);
            return;
        }

        const handler = PaystackPop.setup({
            key: paystackKey,
            email: user.email,
            amount: 100000, // ₦1,000 in kobo
            currency: "NGN",
            ref: `agent-verify-${user.id}-${Date.now()}`,
            metadata: {
                custom_fields: [
                    { display_name: "Purpose", variable_name: "purpose", value: "Agent Verification & Screening" },
                    { display_name: "Agent Name", variable_name: "agent_name", value: user.name },
                ],
            },
            callback: function (response: any) {
                handlePaymentSuccess(response);
            },
            onClose: function () {
                setIsPaymentLoading(false);
            },
            onSuccess: function (response: any) {
                handlePaymentSuccess(response);
            },
        });
        handler.openIframe();
    };

    const handlePaymentSuccess = async (response: any) => {
        try {
            const ref = response?.reference || response?.trxref;
            await api.post("/auth/confirm-verification-fee", { reference: ref });
            updateUser({ verificationFeePaid: true });
        } catch (err) {
            console.error("Fee confirmation error:", err);
        } finally {
            setIsPaymentLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
            {/* Minimal Top Header */}
            <header className="border-b border-slate-200 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src={igloo} width={50} height={24} alt="Igloo" priority />
                        </Link>
                        <span className="h-4 w-px bg-slate-200" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Agent Verification
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500 hidden sm:inline">{user.email}</span>
                        <button
                            onClick={() => { logout(); router.push("/login"); }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition cursor-pointer"
                        >
                            <LogOut size={13} />
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Primary Status Card */}
                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                        {/* Status Chip */}
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                feePaid 
                                    ? "bg-amber-50 text-amber-800 border-amber-200" 
                                    : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${feePaid ? "bg-amber-500 animate-pulse" : "bg-rose-500"}`} />
                                {feePaid ? "Under Review" : "Action Required"}
                            </span>

                            <span className="text-xs text-slate-400 font-mono">
                                ID: {user.id.slice(0, 8).toUpperCase()}
                            </span>
                        </div>

                        {/* Title & Overview */}
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {feePaid ? "Application Pending Review" : "Complete Your Verification"}
                        </h1>
                        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                            {feePaid
                                ? "Your identity credentials and verification fee have been received. Our compliance team is verifying your details before publishing rights are granted."
                                : "To maintain trust and safety across student housing, all agents undergo identity verification and pay a one-time screening fee."}
                        </p>

                        {/* Stepper Timeline */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">
                                Verification Progress
                            </h2>

                            <div className="space-y-4">
                                {/* Step 1: Account Registration */}
                                <div className="flex items-start gap-3.5">
                                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 size={15} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-900">Account Created</p>
                                            <span className="text-xs text-emerald-700 font-medium">Completed</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Registered as <strong className="font-medium text-slate-700">{user.name}</strong>
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2: NIN Submission */}
                                <div className="flex items-start gap-3.5">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                        hasNin ? "bg-emerald-600 text-white" : "border-2 border-slate-300 bg-white"
                                    }`}>
                                        {hasNin ? <CheckCircle2 size={15} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-900">National ID (NIN) Submitted</p>
                                            <span className={`text-xs font-medium ${hasNin ? "text-emerald-700" : "text-slate-400"}`}>
                                                {hasNin ? "Verified Format" : "Pending"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                            {user.nin ? `NIN: ••••••••${user.nin.slice(-3)}` : "Identity details recorded"}
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3: Screening Fee */}
                                <div className="flex items-start gap-3.5">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                        feePaid ? "bg-emerald-600 text-white" : "border-2 border-amber-500 bg-amber-50 text-amber-700"
                                    }`}>
                                        {feePaid ? (
                                            <CheckCircle2 size={15} />
                                        ) : (
                                            <span className="text-[10px] font-bold">3</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-900">Verification Fee (₦1,000)</p>
                                            <span className={`text-xs font-medium ${feePaid ? "text-emerald-700" : "text-amber-700"}`}>
                                                {feePaid ? "Paid" : "Required"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {feePaid ? "One-time screening fee verified" : "Required to initiate background and campus check"}
                                        </p>
                                    </div>
                                </div>

                                {/* Step 4: Admin Approval */}
                                <div className="flex items-start gap-3.5">
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center shrink-0 mt-0.5">
                                        <Clock size={13} className="text-slate-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-700">Admin Approval & Activation</p>
                                            <span className="text-xs text-slate-400 font-medium">In Queue</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Typical review turnaround is within 24 to 48 hours
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Box: Pay Fee if Unpaid */}
                        {!feePaid && (
                            <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Pay Agent Verification Fee
                                        </h3>
                                        <p className="text-xs text-slate-600 mt-0.5">
                                            A one-off fee of <strong>₦1,000</strong> is required to submit your profile for admin verification.
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-lg font-bold text-slate-900">₦1,000</span>
                                        <span className="block text-[10px] text-slate-400 uppercase tracking-wider">One-time</span>
                                    </div>
                                </div>

                                {payError && (
                                    <div className="mt-3 flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                                        <AlertCircle size={14} className="shrink-0" />
                                        <span>{payError}</span>
                                    </div>
                                )}

                                <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                                    <button
                                        onClick={handlePayFee}
                                        disabled={isPaymentLoading}
                                        className="w-full sm:w-auto flex-1 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold py-3 px-5 rounded-lg flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50 cursor-pointer"
                                    >
                                        {isPaymentLoading ? (
                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <CreditCard size={15} />
                                                <span>Pay ₦1,000 with Paystack</span>
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                        <Lock size={12} />
                                        <span>PCI-DSS Compliant</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Confirmation Box if Fee Paid */}
                        {feePaid && (
                            <div className="mt-8 p-5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-3.5">
                                <FileCheck2 size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                                <div className="text-xs text-emerald-900 leading-relaxed">
                                    <p className="font-semibold text-sm text-emerald-900">
                                        Payment Received &amp; Profile Under Review
                                    </p>
                                    <p className="mt-1 text-emerald-800">
                                        Your ₦1,000 screening fee has been confirmed. The administration team has been notified and will verify your campus jurisdiction and National ID. You will be granted immediate access once approved.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Trust & Guidelines Sidebar */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
                                <Shield size={18} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Why Verification Matters</h3>
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                Igloo is dedicated to protecting students from fraudulent listings. Verifying agent identities ensures only genuine, vetted property managers publish on the platform.
                            </p>

                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                    <span>Verified Agent badge on listings</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                    <span>Direct WhatsApp student inquiries</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                    <span>Uncapped property listings</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-900 text-sm font-bold mb-2">
                                <HelpCircle size={16} className="text-slate-500" />
                                <span>Support Desk</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Questions regarding your submission or expedited review? Reach our compliance department:
                            </p>
                            <a 
                                href="mailto:compliance@igloo.ng" 
                                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline"
                            >
                                <span>compliance@igloo.ng</span>
                                <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

