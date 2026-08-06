"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { toast } from "@/app/stores/useToastStore";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Home, School } from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/common/Button";
import api from "@/app/lib/axios";

function PostUtmeStudentSignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect");
    const register = useAuthStore((state) => state.register);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // University State
    const [universities, setUniversities] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [selectedUniversity, setSelectedUniversity] = useState("");

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await api.get('/university');
                if (response.data && response.data.success) {
                    setUniversities(response.data.data);
                    
                    // Pre-select Olabisi Onabanjo University (OOU) if available, since Post-UTME is centered there
                    const oou = response.data.data.find((uni: any) => 
                        uni.name.toLowerCase().includes("olabisi") || uni.name.toLowerCase().includes("oou")
                    );
                    if (oou) {
                        setSelectedUniversity(oou.id);
                    }
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
        setIsLoading(true);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const result = await register(fullName, email, password, "student" as any, selectedUniversity); // eslint-disable-line @typescript-eslint/no-explicit-any

        if (result.success) {
            toast.success("Student account created successfully!");
            if (redirectPath) {
                router.push(decodeURIComponent(redirectPath));
            } else {
                router.push("/post-utme");
            }
        } else {
            setError(result.error || "Signup failed");
            toast.error(result.error || "Signup failed");
            setIsLoading(false);
        }
    };

    const loginRedirectQuery = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : "";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#008489]/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <Link href="/post-utme" className="inline-flex items-center gap-2 mb-4">
                        <div className="bg-[#008489] text-white text-xs font-black px-2 py-1 rounded-lg">POST-UTME PORTAL</div>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Registration</h1>
                    <p className="text-gray-600 text-sm">Create a student account to book short-stay accommodation</p>
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

                        {/* University Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                University / Institution
                            </label>
                            <div className="relative">
                                <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <select
                                    required
                                    value={selectedUniversity}
                                    onChange={(e) => setSelectedUniversity(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008489] focus:border-transparent transition appearance-none bg-white"
                                >
                                    <option value="" disabled>Select your university</option>
                                    {universities.map((uni) => (
                                        <option key={uni.id} value={uni.id}>
                                            {uni.name} ({uni.state})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008489] focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="student@example.com"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008489] focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 8 chars, letters & numbers"
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

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#008489] hover:bg-[#006b6e] text-white border-none"
                            size="lg"
                        >
                            {isLoading ? "Creating Account..." : "Create Student Account"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Already have an account?{" "}
                        <Link href={`/post-utme/login${loginRedirectQuery}`} className="text-[#008489] font-semibold hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>

                <div className="text-center mt-6">
                    <Link href="/post-utme" className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center justify-center gap-1.5">
                        <Home size={14} /> Back to Post-UTME Marketplace
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function PostUtmeStudentSignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008489]"></div>
            </div>
        }>
            <PostUtmeStudentSignupForm />
        </Suspense>
    );
}
