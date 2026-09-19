"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { toast } from "@/app/stores/useToastStore";
import { motion } from "framer-motion";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    School,
    GraduationCap,
    Building2,
    ShieldCheck,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Fingerprint
} from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/common/Button";
import api from "@/app/lib/axios";
import Image from "next/image";
import { igloo } from "../assets";
import { loadPaystack } from "@/app/utils/paystack";

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleQuery = searchParams.get("role");

    const register = useAuthStore((state) => state.register);

    const [role, setRole] = useState<"student" | "agent">(
        roleQuery === "agent" ? "agent" : "student"
    );

    useEffect(() => {
        if (roleQuery === "agent") setRole("agent");
        if (roleQuery === "student") setRole("student");
    }, [roleQuery]);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nin, setNin] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // University State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [universities, setUniversities] = useState<any[]>([]);
    const [selectedUniversity, setSelectedUniversity] = useState("");

    // Paystack payment modal state for agents
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [registeredUserId, setRegisteredUserId] = useState("");

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await api.get("/university");
                if (response.data && response.data.success) {
                    setUniversities(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch universities", err);
            }
        };
        fetchUniversities();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!selectedUniversity) {
            setError("Please select your university.");
            return;
        }

        if (role === "agent") {
            if (!nin || nin.trim().length !== 11) {
                setError("Please enter a valid 11-digit NIN number.");
                return;
            }
        }

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (role === "agent") {
            // Agent Registration
            try {
                const response = await api.post("/auth/register", {
                    fullName,
                    email,
                    password,
                    role: "agent",
                    universityId: selectedUniversity,
                    nin: nin.trim(),
                });

                if (response.data.success) {
                    const userData = response.data.data.user;
                    const token = response.data.data.token;

                    useAuthStore.setState({
                        user: {
                            id: userData.id,
                            email: userData.email,
                            name: userData.fullName,
                            role: "agent",
                            bio: userData.bio,
                            whatsapp: userData.whatsapp,
                            universityId: userData.universityId,
                            isVerified: userData.isVerified,
                            verificationStatus: userData.verificationStatus,
                            token: token,
                        },
                        isAuthenticated: true,
                    });

                    setRegisteredUserId(userData.id);
                    setIsLoading(false);
                    setShowPaymentModal(true);
                } else {
                    setError(response.data.message || "Agent signup failed");
                    setIsLoading(false);
                }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Agent signup failed");
                setIsLoading(false);
            }
        } else {
            // Student / Normal User Registration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await register(fullName, email, password, "student" as any, selectedUniversity);

            if (result.success) {
                toast.success("Student account created successfully!");
                if (result.redirectTo) {
                    router.push(result.redirectTo);
                } else {
                    router.push("/dashboard");
                }
            } else {
                setError(result.error || "Signup failed");
                toast.error(result.error || "Signup failed");
                setIsLoading(false);
            }
        }
    };

    const handlePayVerificationFee = async () => {
        setIsPaymentLoading(true);
        try {
            await loadPaystack();
        } catch {
            setError("Failed to load payment processor. Please try again.");
            setIsPaymentLoading(false);
            return;
        }

        const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const PaystackPop = (window as any).PaystackPop;
        if (!PaystackPop) {
            setError("Payment processor unavailable. Please refresh and try again.");
            setIsPaymentLoading(false);
            return;
        }

        const handler = PaystackPop.setup({
            key: paystackKey,
            email: email,
            amount: 100000, // ₦1,000 in kobo
            currency: "NGN",
            ref: `agent-verify-${registeredUserId}-${Date.now()}`,
            metadata: {
                custom_fields: [
                    { display_name: "Purpose", variable_name: "purpose", value: "Agent Verification Fee" },
                ],
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: function (response: any) {
                handlePaymentSuccess(response);
            },
            onClose: function () {
                setIsPaymentLoading(false);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSuccess: function (response: any) {
                handlePaymentSuccess(response);
            },
        });
        handler.openIframe();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePaymentSuccess = async (response: any) => {
        try {
            const ref = response?.reference || response?.trxref;
            await api.post("/auth/confirm-verification-fee", { reference: ref });
        } catch (err) {
            console.error("Fee confirmation error:", err);
        } finally {
            setIsPaymentLoading(false);
            router.push("/agents/pending-approval");
        }
    };

    const handleSkipPayment = () => {
        router.push("/agents/pending-approval");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Paystack Payment Modal (Agent Only) */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <ShieldCheck size={32} />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Verification</h2>
                            <p className="text-gray-600 text-sm mb-6">
                                Your account is created! To protect students and activate your verified badge, complete your ₦1,000 verification payment.
                            </p>

                            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 text-left">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">Verification Fee</span>
                                    <span className="font-extrabold text-gray-900">₦1,000</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-400">
                                    <span>One-time fee</span>
                                    <span>Secured via Paystack</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={handlePayVerificationFee}
                                disabled={isPaymentLoading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-bold"
                            >
                                {isPaymentLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard size={18} />
                                        Pay ₦1,000 via Paystack
                                    </>
                                )}
                            </Button>

                            <button
                                onClick={handleSkipPayment}
                                className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 font-medium py-2 transition cursor-pointer"
                            >
                                Pay later (account stays pending until verified)
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10 my-8"
            >
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 mb-3">
                        <Image src={igloo} width={100} height={30} alt="logo" />
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        {role === "agent" ? "Join as Verified Agent" : "Create Student Account"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {role === "agent"
                            ? "List properties and manage student accommodation"
                            : "Join Igloo to find verified housing & roommates"}
                    </p>
                </div>

                {/* Signup Card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
                    {/* Role Selector Tabs */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                            Select Account Type
                        </label>
                        <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => { setRole("student"); setError(""); }}
                                className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    role === "student"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                <GraduationCap size={18} className={role === "student" ? "text-primary" : "text-gray-400"} />
                                <span>Normal User</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => { setRole("agent"); setError(""); }}
                                className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    role === "agent"
                                        ? "bg-white text-green-700 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                <Building2 size={18} className={role === "agent" ? "text-green-600" : "text-gray-400"} />
                                <span>Agent / Host</span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                            >
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder={role === "agent" ? "e.g. Samuel Adewale" : "e.g. John Doe"}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition"
                                />
                            </div>
                        </div>

                        {/* University Dropdown */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                {role === "agent" ? "Primary Campus / University" : "Your University"}
                            </label>
                            <div className="relative">
                                <School className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    required
                                    value={selectedUniversity}
                                    onChange={(e) => setSelectedUniversity(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition appearance-none bg-white"
                                >
                                    <option value="" disabled>Select university</option>
                                    {universities.map((uni) => (
                                        <option key={uni.id} value={uni.id}>
                                            {uni.name} ({uni.state})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Agent-Specific NIN Field */}
                        {role === "agent" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                            >
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    National Identification Number (NIN)
                                </label>
                                <div className="relative">
                                    <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        maxLength={11}
                                        value={nin}
                                        onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                                        placeholder="11-digit NIN"
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm transition tracking-wider font-mono"
                                    />
                                </div>
                                <p className="text-[11px] text-gray-500">
                                    🛡️ Your NIN is kept strictly confidential and used solely to verify agent identity.
                                </p>
                            </motion.div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={role === "agent" ? "agent@igloo.com" : "student@igloo.com"}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition ${
                                role === "agent"
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-primary hover:bg-primary/90 text-white"
                            }`}
                        >
                            {isLoading ? (
                                "Creating Account..."
                            ) : role === "agent" ? (
                                "Continue to Verification (₦1,000)"
                            ) : (
                                "Create Student Account"
                            )}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-xs text-gray-500 mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary font-bold hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-5">
                    <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 transition font-medium">
                        ← Back to home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <SignupForm />
        </Suspense>
    );
}
