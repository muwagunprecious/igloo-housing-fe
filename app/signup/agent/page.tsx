"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Home, Briefcase, School, CreditCard, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/common/Button";
import api from "@/app/lib/axios";
import { loadPaystack } from "@/app/utils/paystack";

function AgentSignupForm() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nin, setNin] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // University State
    const [universities, setUniversities] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [selectedUniversity, setSelectedUniversity] = useState("");

    // Payment modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [registeredUserId, setRegisteredUserId] = useState("");

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await api.get('/university');
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

        if (!nin || nin.trim().length !== 11) {
            setError("Please enter a valid 11-digit NIN number.");
            return;
        }

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        try {
            const response = await api.post('/auth/register', {
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
                        role: userData.role.toLowerCase() as "agent",
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
                setError(response.data.message || "Signup failed");
                setIsLoading(false);
            }
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.response?.data?.message || err.message || "Signup failed");
            setIsLoading(false);
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
            amount: 100000, // â‚¦1,000 in kobo
            currency: "NGN",
            ref: `agent-verify-${registeredUserId}-${Date.now()}`,
            metadata: {
                custom_fields: [
                    { display_name: "Purpose", variable_name: "purpose", value: "Agent Verification Fee" },
                ],
            },
            callback: function (response: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                handlePaymentSuccess(response);
            },
            onClose: function () {
                setIsPaymentLoading(false);
            },
            onSuccess: function (response: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                handlePaymentSuccess(response);
            },
        });
        handler.openIframe();
    };

    const handlePaymentSuccess = async (response: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        try {
            const ref = response?.reference || response?.trxref;
            await api.post('/auth/confirm-verification-fee', { reference: ref });
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Paystack Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        <div className="bg-green-600 p-8 text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <ShieldCheck size={36} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">One Last Step!</h2>
                            <p className="text-green-100 text-sm">Pay the agent verification fee to submit your application</p>
                        </div>

                        <div className="p-8">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold mb-1">Why is this required?</p>
                                    <p>A one-time â‚¦1,000 fee validates your agent account, ensuring a trusted marketplace for students.</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">Verification Fee</span>
                                    <span className="font-bold text-gray-900">â‚¦1,000</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>One-time payment</span>
                                    <span>Secured by Paystack</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                    <span className="text-gray-700">Account created successfully</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                    <span className="text-gray-700">NIN submitted for verification</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium">
                                    <div className="w-[18px] h-[18px] rounded-full border-2 border-green-500 shrink-0 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-gray-800">Pay â‚¦1,000 verification fee</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm opacity-40">
                                    <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-400 shrink-0" />
                                    <span className="text-gray-700">Admin reviews &amp; approves your account</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={handlePayVerificationFee}
                                disabled={isPaymentLoading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                            >
                                {isPaymentLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard size={18} />
                                        Pay â‚¦1,000 Now
                                    </>
                                )}
                            </Button>

                            <button
                                onClick={handleSkipPayment}
                                className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 font-medium transition py-2"
                            >
                                Pay later (account will be inactive until paid)
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                            <Home size={24} />
                        </div>
                        <span className="text-3xl font-bold text-gray-900">IGLOO</span>
                    </Link>
                    <div className="inline-flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full mb-3 border border-green-200">
                        <Briefcase size={14} className="text-green-700" />
                        <span className="text-xs font-semibold text-green-800 uppercase tracking-wide">Agent Portal</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Become an Agent</h1>
                    <p className="text-gray-600">List properties and reach thousands of students</p>
                </div>

                {/* Signup Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* University */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Campus/University</label>
                            <div className="relative">
                                <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <select
                                    required
                                    value={selectedUniversity}
                                    onChange={(e) => setSelectedUniversity(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none bg-white"
                                >
                                    <option value="" disabled>Select your main campus</option>
                                    {universities.map((uni) => (
                                        <option key={uni.id} value={uni.id}>{uni.name} ({uni.state})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name (or Agency Name)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe Agents"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agent@agency.com"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* NIN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                NIN (National Identification Number)
                            </label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={nin}
                                    onChange={(e) => setNin(e.target.value.replace(/\D/g, "").slice(0, 11))}
                                    placeholder="Enter your 11-digit NIN"
                                    maxLength={11}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition font-mono tracking-widest"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <ShieldCheck size={12} /> Your NIN is kept secure and reviewed only by admin.
                            </p>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
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

                        {/* Notice */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 text-xs text-blue-800">
                            <AlertCircle size={16} className="shrink-0 mt-0.5 text-blue-500" />
                            <span>After signing up you will pay a one-time <strong>â‚¦1,000 verification fee</strong> via Paystack, then your account will be reviewed by our admin team before activation.</span>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isLoading ? "Creating Account..." : "Continue to Verification â†’"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-green-600 font-semibold hover:underline">Log in</Link>
                    </p>

                    <div className="mt-4 text-center">
                        <Link href="/signup" className="text-xs text-gray-500 hover:text-gray-700 underline">
                            Looking for a home? Join as a student
                        </Link>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">â† Back to home</Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function AgentSignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>}>
            <AgentSignupForm />
        </Suspense>
    );
    // University State
