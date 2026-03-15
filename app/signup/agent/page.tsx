"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Home, Briefcase, School } from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/common/Button";
import api from "@/app/lib/axios";

function AgentSignupForm() {
    const router = useRouter();
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

        const result = await register(fullName, email, password, "agent", selectedUniversity);

        if (result.success) {
            router.push("/agents/dashboard");
        } else {
            setError(result.error || "Signup failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
            </div>

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
                        <span className="text-xs font-semibold text-green-800 uppecase tracking-wide">Agent Portal</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Become an Agent</h1>
                    <p className="text-gray-600">List properties and reach thousands of students</p>
                </div>

                {/* Signup Card */}
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

                        {/* University Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Primary Campus/University
                            </label>
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
                                        <option key={uni.id} value={uni.id}>
                                            {uni.name} ({uni.state})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Full Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name (or Agency Name)
                            </label>
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

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Work Email
                            </label>
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

                        {/* Signup Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isLoading ? "Creating Account..." : "Join as Agent"}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-green-600 font-semibold hover:underline">
                            Log in
                        </Link>
                    </p>

                    <div className="mt-4 text-center">
                        <Link href="/signup" className="text-xs text-gray-500 hover:text-gray-700 underline">
                            Looking for a home? Join as a student
                        </Link>
                    </div>

                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
                        ← Back to home
                    </Link>
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
}
