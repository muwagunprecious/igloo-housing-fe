"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import api from "@/app/lib/axios";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { toast } from "@/app/stores/useToastStore";
import { loadPaystack } from "@/app/utils/paystack";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    CreditCard,
    Fingerprint,
    School,
    CheckCircle2,
    AlertCircle,
    Building2,
    GraduationCap,
    ArrowRight,
    User,
    Phone,
    Loader2
} from "lucide-react";
import Button from "@/app/components/common/Button";

function ClerkCallbackContent() {
    const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role");

    const [statusText, setStatusText] = useState("Authenticating with Igloo...");
    const [isSyncing, setIsSyncing] = useState(true);

    // Agent Verification & Details Modal State
    const [showAgentVerification, setShowAgentVerification] = useState(false);
    const [agentFullName, setAgentFullName] = useState("");
    const [agentPhone, setAgentPhone] = useState("");
    const [agentNIN, setAgentNIN] = useState("");
    const [selectedUniversity, setSelectedUniversity] = useState("");
    const [isPaying, setIsPaying] = useState(false);
    const [agentError, setAgentError] = useState("");

    // Student Onboarding Modal State
    const [showStudentOnboarding, setShowStudentOnboarding] = useState(false);
    const [studentFullName, setStudentFullName] = useState("");
    const [studentPhone, setStudentPhone] = useState("");
    const [studentUniversity, setStudentUniversity] = useState("");
    const [isSavingStudent, setIsSavingStudent] = useState(false);
    const [studentError, setStudentError] = useState("");

    // Role Selection Modal (if user signed in via social without prior role)
    const [showRoleSelector, setShowRoleSelector] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [universities, setUniversities] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Fetch Universities for Selectors
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

    // Main Synchronization & Assessment Effect
    useEffect(() => {
        if (!isClerkLoaded) return;

        if (!isSignedIn || !clerkUser) {
            router.push("/sign-in");
            return;
        }

        const evaluateUser = async () => {
            try {
                setStatusText("Checking your profile...");

                const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;
                if (!primaryEmail) {
                    toast.error("No email address associated with your Clerk account.");
                    router.push("/sign-in");
                    return;
                }

                // Determine role from query, session, or clerk metadata
                let role = roleParam;
                if (!role && typeof window !== "undefined") {
                    role = sessionStorage.getItem("igloo_pending_role");
                }
                if (!role && clerkUser.unsafeMetadata?.role) {
                    role = clerkUser.unsafeMetadata.role as string;
                }

                // Check backend to see if user exists and what info they have
                const checkRes = await api.get(`/auth/check-role?email=${encodeURIComponent(primaryEmail)}`);
                let existingUser = null;
                if (checkRes.data?.success && checkRes.data.data?.exists) {
                    existingUser = checkRes.data.data;
                    if (!role) {
                        role = existingUser.role.toLowerCase();
                    }
                }

                if (!role) {
                    // Prompt role selection if still ambiguous
                    setIsSyncing(false);
                    setShowRoleSelector(true);
                    return;
                }

                const rawClerkName = (clerkUser.fullName || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim());
                const isClerkNameDummy = !rawClerkName || rawClerkName.toUpperCase() === "JOHN DOE";
                const isDbNameDummy = !existingUser?.fullName || existingUser.fullName.toUpperCase() === "JOHN DOE";

                const initialName = !isDbNameDummy
                    ? existingUser.fullName
                    : (!isClerkNameDummy ? rawClerkName : "");

                const initialPhone = existingUser?.whatsapp || clerkUser.primaryPhoneNumber?.phoneNumber || "";
                const initialUni = existingUser?.universityId || "";

                // Store backend user reference if exists
                if (existingUser) {
                    setCurrentUser(existingUser);
                }

                // CASE 1: AGENT
                if (role.toLowerCase() === "agent") {
                    const needsAgentSetup =
                        !existingUser ||
                        !existingUser.verificationFeePaid ||
                        !existingUser.nin ||
                        !existingUser.whatsapp ||
                        !existingUser.fullName ||
                        existingUser.fullName.toUpperCase() === "JOHN DOE";

                    if (needsAgentSetup) {
                        setAgentFullName(initialName);
                        setAgentPhone(initialPhone);
                        if (existingUser?.nin) setAgentNIN(existingUser.nin);
                        if (initialUni) setSelectedUniversity(initialUni);
                        setIsSyncing(false);
                        setShowAgentVerification(true);
                        return;
                    }

                    // Already complete & verified agent -> Sync and navigate
                    await performSyncAndRedirect(role, initialName, initialPhone, initialUni);
                    return;
                }

                // CASE 2: STUDENT / NORMAL USER
                const needsStudentSetup =
                    !initialName ||
                    initialName.toUpperCase() === "JOHN DOE" ||
                    !initialPhone;

                if (needsStudentSetup) {
                    setStudentFullName(initialName);
                    setStudentPhone(initialPhone);
                    if (initialUni) setStudentUniversity(initialUni);
                    setIsSyncing(false);
                    setShowStudentOnboarding(true);
                    return;
                }

                // Student profile already complete -> Sync and navigate
                await performSyncAndRedirect(role, initialName, initialPhone, initialUni);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error("Clerk evaluate error:", err);
                toast.error(err.response?.data?.message || "Failed to initialize your account.");
                setIsSyncing(false);
            }
        };

        evaluateUser();
    }, [isClerkLoaded, isSignedIn, clerkUser, roleParam, router]);

    // Helper: Perform backend sync and route
    const performSyncAndRedirect = async (
        role: string,
        name: string,
        phone: string,
        uniId?: string
    ) => {
        const primaryEmail = clerkUser?.primaryEmailAddress?.emailAddress;
        if (!primaryEmail) return;

        setStatusText("Entering your dashboard...");
        setIsSyncing(true);

        const syncResponse = await api.post("/auth/clerk-sync", {
            clerkId: clerkUser?.id,
            email: primaryEmail,
            fullName: name || undefined,
            whatsapp: phone || undefined,
            universityId: uniId || undefined,
            role: role.toUpperCase(),
            avatar: clerkUser?.imageUrl || null,
        });

        if (!syncResponse.data.success) {
            toast.error("Failed to sync account.");
            router.push("/");
            return;
        }

        const { user: backendUser, token } = syncResponse.data.data;
        setCurrentUser(backendUser);

        // Update Clerk unsafeMetadata
        try {
            await clerkUser?.update({
                unsafeMetadata: { role: backendUser.role.toLowerCase() }
            });
        } catch {
            // Non-fatal
        }

        // Update Zustand
        useAuthStore.setState({
            user: {
                id: backendUser.id,
                email: backendUser.email,
                name: backendUser.fullName,
                role: backendUser.role.toLowerCase() as "student" | "agent" | "admin" | "renter",
                avatar: backendUser.avatar,
                bio: backendUser.bio,
                whatsapp: backendUser.whatsapp,
                universityId: backendUser.universityId,
                isVerified: backendUser.isVerified,
                verificationStatus: backendUser.verificationStatus,
                verificationFeePaid: backendUser.verificationFeePaid,
                nin: backendUser.nin,
                token: token,
            },
            isAuthenticated: true,
            isLoading: false,
        });

        if (typeof window !== "undefined") {
            sessionStorage.removeItem("igloo_pending_role");
        }

        const userRole = backendUser.role.toLowerCase();
        if (userRole === "agent") {
            const isApproved = backendUser.isVerified || backendUser.verificationStatus === "APPROVED" || backendUser.verificationStatus === "VERIFIED";
            if (isApproved) {
                toast.success(`Welcome back, Agent ${backendUser.fullName}!`);
                router.push("/agents/dashboard");
            } else {
                toast.info("Agent verification under review.");
                router.push("/agents/pending-approval");
            }
        } else if (userRole === "admin") {
            router.push("/admin/dashboard");
        } else {
            toast.success(`Welcome to Igloo, ${backendUser.fullName}!`);
            router.push("/dashboard");
        }
    };

    // Handler when user picks role on callback page
    const handlePickRole = async (pickedRole: "student" | "agent") => {
        setShowRoleSelector(false);
        setIsSyncing(true);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("igloo_pending_role", pickedRole);
        }
        router.replace(`/auth/clerk-callback?role=${pickedRole}`);
    };

    // STUDENT SUBMIT: Save Name and Phone Number
    const handleSaveStudentProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setStudentError("");

        const cleanName = studentFullName.trim();
        const cleanPhone = studentPhone.trim();

        if (!cleanName || cleanName.toUpperCase() === "JOHN DOE") {
            setStudentError("Please enter your real full name.");
            return;
        }

        if (!cleanPhone || cleanPhone.length < 9) {
            setStudentError("Please enter a valid phone or WhatsApp number.");
            return;
        }

        setIsSavingStudent(true);
        try {
            await performSyncAndRedirect("student", cleanName, cleanPhone, studentUniversity);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setStudentError(err.response?.data?.message || "Failed to save profile. Please try again.");
            setIsSavingStudent(false);
        }
    };

    // AGENT SUBMIT: Paystack Verification Payment Handler
    const handlePayVerificationFee = async () => {
        setAgentError("");

        const cleanName = agentFullName.trim();
        const cleanPhone = agentPhone.trim();
        const cleanNIN = agentNIN.trim();

        if (!cleanName || cleanName.toUpperCase() === "JOHN DOE") {
            setAgentError("Please enter your real full name.");
            return;
        }

        if (!cleanPhone || cleanPhone.length < 9) {
            setAgentError("Please enter a valid WhatsApp phone number for students to reach you.");
            return;
        }

        if (!cleanNIN || cleanNIN.length !== 11) {
            setAgentError("Please enter a valid 11-digit NIN number.");
            return;
        }

        if (!selectedUniversity) {
            setAgentError("Please select your primary university / campus.");
            return;
        }

        setIsPaying(true);

        try {
            await loadPaystack();
        } catch {
            setAgentError("Failed to load Paystack payment processor. Please try again.");
            setIsPaying(false);
            return;
        }

        const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_5416765eee4770e59472cf1f9a7190f4352fcb8e";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const PaystackPop = (window as any).PaystackPop;
        if (!PaystackPop) {
            setAgentError("Paystack is currently unavailable. Please refresh and try again.");
            setIsPaying(false);
            return;
        }

        const email = clerkUser?.primaryEmailAddress?.emailAddress || currentUser?.email || "";
        const userId = currentUser?.id || clerkUser?.id;

        const handler = PaystackPop.setup({
            key: paystackKey,
            email: email,
            amount: 100000, // ₦1,000 in kobo
            currency: "NGN",
            ref: `agent-verify-${userId}-${Date.now()}`,
            metadata: {
                custom_fields: [
                    { display_name: "Purpose", variable_name: "purpose", value: "Agent NIN & Verification Fee" },
                    { display_name: "Agent Name", variable_name: "agent_name", value: cleanName },
                    { display_name: "NIN", variable_name: "nin", value: cleanNIN },
                    { display_name: "WhatsApp", variable_name: "whatsapp", value: cleanPhone },
                ],
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: function (response: any) {
                handlePaymentSuccess(response, cleanName, cleanPhone, cleanNIN);
            },
            onClose: function () {
                setIsPaying(false);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSuccess: function (response: any) {
                handlePaymentSuccess(response, cleanName, cleanPhone, cleanNIN);
            },
        });

        handler.openIframe();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePaymentSuccess = async (response: any, name: string, phone: string, nin: string) => {
        try {
            const ref = response?.reference || response?.trxref;
            const res = await api.post("/auth/agent-verify", {
                userId: currentUser?.id,
                clerkId: clerkUser?.id,
                email: clerkUser?.primaryEmailAddress?.emailAddress || currentUser?.email,
                fullName: name,
                whatsapp: phone,
                nin: nin,
                universityId: selectedUniversity,
                reference: ref,
            });

            if (res.data?.success) {
                const updatedUser = res.data.data.user;
                const token = res.data.data.token;
                useAuthStore.setState((prev) => ({
                    ...prev,
                    user: {
                        ...prev.user,
                        ...updatedUser,
                        name: updatedUser.fullName,
                        whatsapp: updatedUser.whatsapp,
                        role: "agent",
                        verificationFeePaid: true,
                        verificationStatus: "PENDING",
                        token: token || prev.user?.token,
                    },
                    isAuthenticated: true,
                    isLoading: false,
                }));
            }

            toast.success("Verification fee paid! Your agent application is submitted for review.");
            setShowAgentVerification(false);
            router.push("/agents/pending-approval");
        } catch (err) {
            console.error("Agent verification submit error:", err);
            toast.error("Payment recorded. Redirecting to pending approval.");
            router.push("/agents/pending-approval");
        } finally {
            setIsPaying(false);
        }
    };

    const handleSkipVerificationForNow = async () => {
        const cleanName = agentFullName.trim();
        const cleanPhone = agentPhone.trim();

        // Still save their name and phone to clerk-sync so they don't lose it!
        try {
            const primaryEmail = clerkUser?.primaryEmailAddress?.emailAddress;
            if (primaryEmail) {
                await api.post("/auth/clerk-sync", {
                    clerkId: clerkUser.id,
                    email: primaryEmail,
                    fullName: cleanName || undefined,
                    whatsapp: cleanPhone || undefined,
                    universityId: selectedUniversity || undefined,
                    role: "AGENT",
                    avatar: clerkUser.imageUrl || null,
                });
            }
        } catch {
            // Ignore background sync errors on skip
        }

        setShowAgentVerification(false);
        toast.info("Your agent account is pending verification and fee payment.");
        router.push("/agents/pending-approval");
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FFF1F2] rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#FFF1F2] rounded-full blur-3xl"></div>
            </div>

            {/* Syncing Loader */}
            {isSyncing && !showAgentVerification && !showStudentOnboarding && !showRoleSelector && (
                <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] border border-gray-100 max-w-sm w-full text-center z-10">
                    <div className="w-12 h-12 border-4 border-[#FFF1F2] border-t-[#FF385C] rounded-full animate-spin mx-auto mb-4" />
                    <h3 className="font-black text-gray-900 text-lg mb-1">{statusText}</h3>
                    <p className="text-xs text-gray-500">Connecting your profile to Igloo Housing</p>
                </div>
            )}

            {/* POPUP 1: STUDENT / NORMAL USER ONBOARDING MODAL */}
            <AnimatePresence>
                {showStudentOnboarding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[3px] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] relative overflow-hidden border border-gray-100 text-gray-900"
                        >
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-[#FFF1F2] text-[#FF385C] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#FF385C]/20 shadow-sm">
                                    <GraduationCap size={24} />
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] text-[#FF385C] text-[10px] font-bold uppercase tracking-wider mb-2">
                                    Profile Setup
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1">
                                    Complete Your Profile
                                </h2>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Please enter your full name and WhatsApp phone number so verified agents and prospective roommates can contact you.
                                </p>
                            </div>

                            {studentError && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 text-left">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span>{studentError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSaveStudentProfile} className="space-y-4 text-left">
                                {/* Full Name Input */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Your Full Name <span className="text-[#FF385C]">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
                                        <input
                                            type="text"
                                            required
                                            value={studentFullName}
                                            onChange={(e) => setStudentFullName(e.target.value)}
                                            placeholder="e.g. Precious Ademuwagun"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] text-sm font-semibold text-gray-900 placeholder-gray-400 transition"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">This name will be displayed on your profile and dashboard.</p>
                                </div>

                                {/* Phone / WhatsApp Input */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        WhatsApp Phone Number <span className="text-[#FF385C]">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
                                        <input
                                            type="tel"
                                            required
                                            value={studentPhone}
                                            onChange={(e) => setStudentPhone(e.target.value)}
                                            placeholder="e.g. 08012345678 or +234..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] text-sm font-semibold text-gray-900 placeholder-gray-400 transition"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Directly used to connect with housing agents & roommates.</p>
                                </div>

                                {/* University / Campus Selector */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        University / Campus <span className="text-gray-400 text-[10px] font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <School className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
                                        <select
                                            value={studentUniversity}
                                            onChange={(e) => setStudentUniversity(e.target.value)}
                                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] text-sm font-semibold text-gray-800 transition appearance-none cursor-pointer"
                                        >
                                            <option value="" className="text-gray-400">Select your campus (shows close listings)</option>
                                            {universities.map((uni) => (
                                                <option key={uni.id} value={uni.id}>
                                                    {uni.name} ({uni.state})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSavingStudent}
                                    className="w-full mt-2 bg-[#FF385C] hover:bg-[#E00B41] text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm shadow-lg shadow-[#FF385C]/25 hover:shadow-[#FF385C]/35 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none"
                                >
                                    {isSavingStudent ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Saving profile...
                                        </>
                                    ) : (
                                        <>
                                            Continue to Dashboard
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* POPUP 2: AGENT ONBOARDING & ₦1,000 PAYSTACK VERIFICATION MODAL */}
            <AnimatePresence>
                {showAgentVerification && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[3px] p-3 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22)] relative overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] text-gray-900"
                        >
                            <div className="text-center overflow-y-auto">
                                <div className="w-12 h-12 bg-[#FFF1F2] text-[#FF385C] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#FF385C]/20 shadow-sm">
                                    <ShieldCheck size={26} />
                                </div>

                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] text-[#FF385C] text-[10px] font-bold uppercase tracking-wider mb-2">
                                    <ShieldCheck size={12} />
                                    <span>Agent Verification & Contact</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1.5">
                                    Agent Account Setup
                                </h2>
                                <p className="text-xs text-gray-500 mb-5 leading-relaxed max-w-md mx-auto">
                                    Enter your details so students can reach you. Then verify your 11-digit NIN and complete the ₦1,000 badge fee to list apartments.
                                </p>

                                {agentError && (
                                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 text-left">
                                        <AlertCircle size={15} className="shrink-0" />
                                        <span>{agentError}</span>
                                    </div>
                                )}

                                <div className="space-y-4 text-left mb-5">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Agent Full Name <span className="text-[#FF385C]">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
                                            <input
                                                type="text"
                                                required
                                                value={agentFullName}
                                                onChange={(e) => setAgentFullName(e.target.value)}
                                                placeholder="e.g. Samuel Adewale"
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] text-sm font-semibold text-gray-900 placeholder-gray-400 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* WhatsApp Phone Number */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            WhatsApp Phone Number <span className="text-[#FF385C]">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
                                            <input
                                                type="tel"
                                                required
                                                value={agentPhone}
                                                onChange={(e) => setAgentPhone(e.target.value)}
                                                placeholder="e.g. 08012345678"
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] text-sm font-semibold text-gray-900 placeholder-gray-400 transition"
                                            />
                                        </div>
                                        <span className="text-[11px] text-gray-400 mt-1 block">Students will call and message you on this WhatsApp line.</span>
                                    </div>

                                    {/* 11-digit NIN Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            National Identification Number (NIN) <span className="text-[#FF385C]">*</span>
                                        </label>
                                        <div className="relative">
                                            <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
                                            <input
                                                type="text"
                                                maxLength={11}
                                                value={agentNIN}
                                                onChange={(e) => setAgentNIN(e.target.value.replace(/\D/g, ""))}
                                                placeholder="Enter 11-digit NIN"
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] text-sm font-mono font-bold text-gray-900 placeholder-gray-400 transition tracking-wider"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
                                            <span>Required for verified status</span>
                                            <span className={`font-mono font-bold ${agentNIN.length === 11 ? "text-emerald-600" : "text-gray-400"}`}>{agentNIN.length}/11 digits</span>
                                        </div>
                                    </div>

                                    {/* University / Primary Campus Selector */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Primary Campus Location <span className="text-[#FF385C]">*</span>
                                        </label>
                                        <div className="relative">
                                            <School className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
                                            <select
                                                value={selectedUniversity}
                                                onChange={(e) => setSelectedUniversity(e.target.value)}
                                                className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] text-sm font-semibold text-gray-800 transition appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled className="text-gray-400">Select university where you operate</option>
                                                {universities.map((uni) => (
                                                  <option key={uni.id} value={uni.id}>
                                                      {uni.name} ({uni.state})
                                                  </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                                                ▼
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Fee Summary Box */}
                                    <div className="bg-[#FFF1F2]/70 rounded-2xl p-4 border border-[#FF385C]/20">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-gray-700">One-time Verification Fee</span>
                                            <span className="font-black text-[#FF385C] text-lg">₦1,000</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] text-gray-500">
                                            <span>Activates Verified Agent Badge</span>
                                            <span className="flex items-center gap-1 text-[#FF385C] font-bold">
                                                <CheckCircle2 size={12} /> Paystack Secured
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={handlePayVerificationFee}
                                    disabled={isPaying}
                                    className="w-full bg-[#FF385C] hover:bg-[#E00B41] text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm shadow-lg shadow-[#FF385C]/25 hover:shadow-[#FF385C]/35 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none"
                                >
                                    {isPaying ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CreditCard size={18} />
                                            Pay ₦1,000 & Submit Verification
                                        </>
                                    )}
                                </Button>

                                <button
                                    type="button"
                                    onClick={handleSkipVerificationForNow}
                                    className="w-full mt-3 text-xs text-gray-500 hover:text-gray-900 font-semibold py-1.5 transition cursor-pointer text-center block"
                                >
                                    Save details & complete payment later
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* POPUP 3: ROLE SELECTOR MODAL (If user has neither role assigned) */}
            <AnimatePresence>
                {showRoleSelector && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[3px] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-center text-gray-900"
                        >
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 tracking-tight">
                                Choose Your Account Type
                            </h2>
                            <p className="text-xs text-gray-500 mb-6">
                                Please tell us how you plan to use Igloo Housing:
                            </p>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => handlePickRole("student")}
                                    className="w-full p-4 rounded-2xl border border-gray-200 hover:border-[#FF385C] hover:bg-[#FFF1F2]/40 transition text-left flex items-center gap-3 cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#FF385C] flex items-center justify-center shrink-0 border border-[#FF385C]/20">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 text-sm group-hover:text-[#FF385C] transition">Normal User / Student</div>
                                        <div className="text-xs text-gray-500">Browse houses & find roommates</div>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-400 group-hover:text-[#FF385C] transition" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handlePickRole("agent")}
                                    className="w-full p-4 rounded-2xl border border-gray-200 hover:border-[#FF385C] hover:bg-[#FFF1F2]/40 transition text-left flex items-center gap-3 cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#FF385C] flex items-center justify-center shrink-0 border border-[#FF385C]/20">
                                        <Building2 size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 text-sm group-hover:text-[#FF385C] transition">Verified Agent / Host</div>
                                        <div className="text-xs text-gray-500">List properties & connect with students</div>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-400 group-hover:text-[#FF385C] transition" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ClerkCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF385C]"></div>
            </div>
        }>
            <ClerkCallbackContent />
        </Suspense>
    );
}
